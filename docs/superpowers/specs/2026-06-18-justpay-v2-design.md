# justpay.wtf v2 — Production-Grade Decentralized Payment Gateway

## Vision

A zero-auth crypto payment gateway where anyone can create payment links (temporary or permanent) without signing up. Merchants connect a wallet to auto-fill their address, generate a link, and share it. Payers open the link, connect any wallet on any supported chain, and pay — with automatic cross-chain swaps/bridges handled inline during checkout.

## Design Decisions

| Decision         | Choice                                        | Rationale                                                                                                                                                              |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decentralization | Hybrid (on-chain escrow + off-chain indexing) | Convex stores link metadata for fast lookups and real-time dashboard. Smart contract escrow handles payment verification trustlessly on-chain.                         |
| Payment Model    | Flash escrow contract                         | Funds flow through in a single atomic tx: receive → verify amount → transfer to merchant. If anything fails, tx reverts and payer keeps funds. No holding period.      |
| Target Chains    | Base + Solana + Sui (first-class)             | Native escrow contracts on all three. Other EVM chains route through LI.FI bridge to Base escrow.                                                                      |
| Revenue          | Free for now (fee mechanism built-in)         | 0% fee in v1 to attract users. Contract has a configurable fee rate (owner can enable later without redeploying). Target: 0.3-0.5% when volume justifies it.           |
| Link Types       | Both (one-time invoices + permanent tip jars) | One-time links expire after payment. Permanent links accept unlimited payments at any amount.                                                                          |
| Backend/DB       | Convex                                        | Automatic real-time reactivity (no subscription setup), TypeScript-native schema (prevents drift), built-in functions replace edge functions, crons for expiry checks. |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Create   │  │ Checkout │  │Dashboard │  │ Merchant  │  │
│  │ Link UI  │  │ Page     │  │          │  │ API Docs  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │              │              │               │        │
│  ┌────┴──────────────┴──────────────┴───────────────┴────┐  │
│  │              Web3 Execution Layer                      │  │
│  │  wagmi (EVM) | wallet-adapter (Solana) | dapp-kit(Sui)│  │
│  └────┬──────────────┬──────────────────────────────┬────┘  │
└───────┼──────────────┼──────────────────────────────┼───────┘
        │              │                              │
        ▼              ▼                              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐
│ JustPay      │ │ JustPay      │ │ JustPay Module            │
│ Escrow (EVM) │ │ Escrow (Sol) │ │ Escrow (Sui Move)         │
│ Base L2      │ │ Solana Prog  │ │ Sui Package               │
└──────┬───────┘ └──────┬───────┘ └────────────┬─────────────┘
       │                 │                      │
       └────────┬────────┴──────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                  INDEXING LAYER (Convex)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Alchemy      │  │ Helius       │  │ Sui Event         │  │
│  │ Webhook(EVM) │  │ Webhook(Sol) │  │ Subscription      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         └──────────┬───────┘───────────────────┘             │
│                    ▼                                          │
│         ┌──────────────────┐                                 │
│         │ Convex HTTP Action│                                │
│         │ (Event Processor) │                                │
│         └────────┬─────────┘                                 │
│                  ▼                                            │
│         ┌──────────────────┐                                 │
│         │   Convex DB      │  ← Auto-pushes to all           │
│         │  (Reactive Store)│    subscribed dashboard UIs      │
│         └──────────────────┘                                 │
└──────────────────────────────────────────────────────────────┘
```

## Smart Contract Design

### EVM Escrow (Solidity — deployed on Base)

```
JustPayEscrow.sol
├── createPaymentIntent(linkId, merchant, token, amount, expiry)
│   → Stores intent on-chain, emits PaymentIntentCreated event
├── pay(linkId) payable
│   → Receives funds, verifies amount, deducts fee, sends to merchant
│   → Emits PaymentCompleted event
├── payWithToken(linkId, token, amount)
│   → ERC20 approval flow, same logic
├── refund(linkId)
│   → Only if conditions met (expired + not yet paid)
├── setFeeRate(rate) onlyOwner
│   → Protocol fee adjustment
└── withdraw() onlyOwner
    → Withdraw accumulated fees
```

Key design:

- **Flash escrow** — funds flow through in a single atomic tx (pay → verify amount → transfer to merchant). No holding period. If anything fails, entire tx reverts and payer keeps funds.
- Fee rate is configurable (starts at 0%, can be enabled later via `setFeeRate`).
- For bridge payments via LI.FI: payer sends to escrow contract as the destination. Contract verifies receipt, forwards to merchant.
- `linkId` is a bytes32 hash derived from the short_code, keeping link identity on-chain without storing full metadata.
- Contract does NOT store link metadata — only the intent (merchant, token, amount, expiry). All other metadata lives in Convex.

### Solana Program (Anchor)

```
justpay_escrow/
├── instructions/
│   ├── create_intent.rs    — PDA per payment intent
│   ├── pay_native.rs       — SOL transfer through program
│   ├── pay_spl.rs          — SPL token transfer through program
│   └── close_intent.rs     — Cleanup expired intents
├── state/
│   └── payment_intent.rs   — On-chain intent account
└── errors.rs
```

### Sui Move Module

```
justpay/
├── sources/
│   ├── escrow.move         — Payment intent objects + pay functions
│   └── fee_vault.move      — Fee collection shared object
└── Move.toml
```

## Payment Flow (v2)

### Link Creation

1. User enters destination address + chain + token + amount (optional for tip jars)
2. Frontend calls Convex mutation `createLink` → inserts link metadata in reactive DB
3. Returns short_code URL (e.g., justpay.wtf/abc123)
4. No on-chain tx at creation time (gas-free for merchant)

### Payment Execution

1. Payer opens link → frontend calls Convex query `getLinkByCode` (reactive, cached)
2. Payer connects wallet, selects source chain
3. Frontend determines routing:
   - **Same chain, same token**: Direct contract call to `pay(linkId)`
   - **Same chain, different token**: LI.FI swap → send result to escrow
   - **Cross-chain**: LI.FI bridge with escrow contract as destination
4. Payer signs and sends transaction
5. Frontend calls Convex mutation `recordTransaction` (optimistic intent)

### Verification

1. Webhook (Alchemy/Helius/Sui subscription) hits Convex HTTP action
2. HTTP action calls internal mutation:
   - Matches to payment_link by linkId hash
   - Updates transaction status to confirmed
   - Updates link status (completed for one-time, stays active for permanent)
3. **Dashboard auto-updates instantly** — all clients subscribed to the merchant's data get pushed the new state automatically (Convex reactivity)
4. Convex action sends email notification if configured

## Link Types

| Type      | Amount               | Expiry       | Multi-use                 | Use Case                         |
| --------- | -------------------- | ------------ | ------------------------- | -------------------------------- |
| Invoice   | Fixed                | Yes (15m-7d) | No                        | One-time payment collection      |
| Tip Jar   | Open (payer decides) | Never        | Yes                       | Donations, tips, creator economy |
| Recurring | Fixed                | Never        | Yes (tracks each payment) | Subscriptions, rent              |

## Convex Schema (v2)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  paymentLinks: defineTable({
    shortCode: v.string(),
    linkType: v.union(
      v.literal("invoice"),
      v.literal("tip_jar"),
      v.literal("recurring"),
    ),

    // Destination
    merchantAddress: v.string(),
    destinationChain: v.union(
      v.literal("base"),
      v.literal("solana"),
      v.literal("sui"),
    ),
    destinationTokenAddress: v.optional(v.string()),
    destinationTokenSymbol: v.string(),

    // Amount (undefined for tip_jar)
    amount: v.optional(v.string()), // stored as string to avoid float precision issues

    // Metadata
    label: v.optional(v.string()),
    memo: v.optional(v.string()),
    merchantEmail: v.optional(v.string()),

    // Lifecycle
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("expired"),
      v.literal("cancelled"),
    ),
    expiresAt: v.optional(v.number()), // Unix timestamp ms

    // On-chain reference
    linkIdHash: v.string(), // bytes32 hex for contract matching
  })
    .index("by_shortCode", ["shortCode"])
    .index("by_merchant", ["merchantAddress"])
    .index("by_status", ["status"]),

  transactions: defineTable({
    linkId: v.id("paymentLinks"),

    // Source (payer)
    payerAddress: v.string(),
    sourceChain: v.string(),
    sourceToken: v.optional(v.string()),
    sourceTxHash: v.string(),
    sourceAmount: v.string(),

    // Destination (result)
    destinationTxHash: v.optional(v.string()),
    destinationAmount: v.optional(v.string()),

    // LI.FI routing (if cross-chain)
    lifiRouteId: v.optional(v.string()),
    bridgeUsed: v.optional(v.string()),

    // Fees
    protocolFee: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("bridging"),
      v.literal("confirmed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_link", ["linkId"])
    .index("by_merchant_link", ["linkId", "status"])
    .index("by_sourceTxHash", ["sourceTxHash"]),
});
```

### Why This Schema Works

- **Type-safe end-to-end** — TypeScript catches schema mismatches at build time, not runtime
- **No migrations** — schema changes are validated on deploy, Convex handles data evolution
- **Indexed queries** — `by_shortCode` for checkout lookups, `by_merchant` for dashboard, `by_sourceTxHash` for webhook matching
- **Amounts as strings** — avoids floating point precision issues with crypto decimals

## Tech Stack

| Layer               | Technology                                                               |
| ------------------- | ------------------------------------------------------------------------ |
| Frontend            | Next.js 16 (App Router), React 19, TailwindCSS 4                         |
| EVM Wallet          | wagmi v3, viem                                                           |
| Solana Wallet       | @solana/wallet-adapter-react                                             |
| Sui Wallet          | @mysten/dapp-kit                                                         |
| Cross-chain Routing | LI.FI SDK v4                                                             |
| EVM Contract        | Solidity, Foundry                                                        |
| Solana Program      | Anchor (Rust)                                                            |
| Sui Module          | Move                                                                     |
| Backend/DB          | Convex (reactive DB + mutations + actions + crons)                       |
| Indexing            | Alchemy Webhooks (EVM), Helius Webhooks (Solana), Sui Event Subscription |
| Hosting             | Vercel (frontend), Convex (backend — fully managed)                      |

## Phased Rollout

### Phase 1: Migrate to Convex + Fix Prototype (1-2 weeks)

- Set up Convex project with schema, mutations, queries, and HTTP actions
- Migrate frontend from Supabase client calls to Convex hooks (`useQuery`, `useMutation`)
- Replace Supabase Edge Functions with Convex actions/HTTP actions
- Fix TypeScript errors (CheckoutClient.tsx chain type)
- Remove all Supabase dependencies and SQL migrations
- Get end-to-end flow working on testnets (Base Sepolia + Solana Devnet + Sui Testnet)

### Phase 2: Smart Contract Escrow (2-3 weeks)

- Write and deploy EVM flash escrow on Base Sepolia (Foundry)
- Write and deploy Solana program on devnet (Anchor)
- Write and deploy Sui module on testnet (Move)
- Update frontend to route payments through contracts
- Set up webhooks → Convex HTTP actions for event indexing

### Phase 3: Cross-Chain via LI.FI + Escrow (1-2 weeks)

- Configure LI.FI to route bridge outputs to escrow contract address
- Handle bridge completion verification via Convex cron polling LI.FI status API
- Add slippage protection and minimum amount checks

### Phase 4: Production Polish (1-2 weeks)

- Deploy contracts to mainnets
- Add permanent link types (tip jar, recurring)
- Email notifications via Convex actions (Resend/SendGrid)
- Dashboard with real-time updates (automatic via Convex reactivity)
- Enable fee mechanism when ready (contract owner call)

### Phase 5: Scale (ongoing)

- Add more chains (Arbitrum, Polygon, Optimism via EVM escrow)
- Fiat on/off ramp integration
- Widget/embed SDK for merchants
- Mobile-optimized checkout
- Premium tier / API key system with higher rate limits
