# justpay.wtf v2 — Production-Grade Decentralized Payment Gateway

## Vision

A zero-auth crypto payment gateway where anyone can create payment links (temporary or permanent) without signing up. Merchants connect a wallet to auto-fill their address, generate a link, and share it. Payers open the link, connect any wallet on any supported chain, and pay — with automatic cross-chain swaps/bridges handled inline during checkout.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Decentralization | Hybrid (on-chain escrow + off-chain indexing) | Supabase stores link metadata for fast lookups and dashboard. Smart contract escrow handles payment custody, verification, and fee collection trustlessly. |
| Payment Model | Escrow contract | Direct transfers are hard to verify, can't handle refunds, and don't guarantee exact amounts after bridging. Escrow receives funds, verifies amount, takes protocol fee, releases to merchant. |
| Target Chains | Base + Solana + Sui (first-class) | Native escrow contracts on all three. Other EVM chains route through LI.FI bridge to Base escrow. |
| Revenue | Fee + Premium | 0.5% fee on free-tier payments (taken by contract). Premium tier (API key) reduces to 0.1% or flat monthly. |
| Link Types | Both (one-time invoices + permanent tip jars) | One-time links expire after payment. Permanent links accept unlimited payments at any amount. |

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
│                  INDEXING LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Alchemy      │  │ Helius       │  │ Sui Event         │  │
│  │ Webhook(EVM) │  │ Webhook(Sol) │  │ Subscription      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         └──────────┬───────┘───────────────────┘             │
│                    ▼                                          │
│         ┌──────────────────┐                                 │
│         │ Supabase Edge Fn │                                 │
│         │ (Event Processor)│                                 │
│         └────────┬─────────┘                                 │
│                  ▼                                            │
│         ┌──────────────────┐                                 │
│         │   Supabase DB    │                                 │
│         │  (Index/Cache)   │                                 │
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
- No actual escrow hold for simple payments — funds flow through in a single tx (pay → fee deduction → merchant transfer). This is "flash escrow" — verification and transfer in one atomic operation.
- For bridge payments via LI.FI: payer sends to escrow contract as the destination. Contract verifies receipt, takes fee, forwards to merchant.
- `linkId` is a bytes32 hash derived from the short_code, keeping link identity on-chain without storing full metadata.

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
2. Frontend calls Supabase edge function → inserts link metadata in DB
3. Returns short_code URL (e.g., justpay.wtf/abc123)
4. No on-chain tx at creation time (gas-free for merchant)

### Payment Execution
1. Payer opens link → frontend fetches link details from Supabase
2. Payer connects wallet, selects source chain
3. Frontend determines routing:
   - **Same chain, same token**: Direct contract call to `pay(linkId)`
   - **Same chain, different token**: LI.FI swap → send result to escrow
   - **Cross-chain**: LI.FI bridge with escrow contract as destination
4. Payer signs and sends transaction
5. Frontend records tx intent in Supabase (optimistic)

### Verification
1. Webhook (Alchemy/Helius/Sui subscription) detects contract event
2. Edge function processes event:
   - Matches to payment_link by linkId
   - Updates transaction status to confirmed
   - Updates link status (completed for one-time, stays active for permanent)
   - Sends email notification if configured
3. Dashboard reflects payment in real-time via Supabase Realtime

## Link Types

| Type | Amount | Expiry | Multi-use | Use Case |
|------|--------|--------|-----------|----------|
| Invoice | Fixed | Yes (15m-7d) | No | One-time payment collection |
| Tip Jar | Open (payer decides) | Never | Yes | Donations, tips, creator economy |
| Recurring | Fixed | Never | Yes (tracks each payment) | Subscriptions, rent |

## Database Schema (v2)

```sql
-- payment_links (enhanced)
payment_links (
  id UUID PK,
  short_code VARCHAR(8) UNIQUE,
  link_type ENUM('invoice', 'tip_jar', 'recurring'),
  
  -- Destination
  merchant_address VARCHAR(128) NOT NULL,
  destination_chain ENUM('base', 'solana', 'sui'),
  destination_token_address VARCHAR(128),
  destination_token_symbol VARCHAR(10),
  
  -- Amount (null for tip_jar)
  amount DECIMAL(28,18),
  
  -- Metadata
  label VARCHAR(255),
  memo TEXT,
  merchant_email VARCHAR(255),
  
  -- Lifecycle
  status ENUM('active', 'completed', 'expired', 'cancelled'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- On-chain reference
  link_id_hash BYTEA -- bytes32 for contract matching
)

-- transactions (enhanced)
transactions (
  id UUID PK,
  link_id UUID FK → payment_links,
  
  -- Source (payer)
  payer_address VARCHAR(128),
  source_chain VARCHAR(20),
  source_token VARCHAR(128),
  source_tx_hash VARCHAR(128),
  source_amount DECIMAL(28,18),
  
  -- Destination (result)
  destination_tx_hash VARCHAR(128),
  destination_amount DECIMAL(28,18),
  
  -- LI.FI routing (if cross-chain)
  lifi_route_id VARCHAR(128),
  bridge_used VARCHAR(50),
  
  -- Fees
  protocol_fee DECIMAL(28,18),
  gas_cost_usd DECIMAL(10,4),
  
  -- Status
  status ENUM('pending', 'bridging', 'confirmed', 'failed', 'refunded'),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TailwindCSS 4 |
| EVM Wallet | wagmi v3, viem |
| Solana Wallet | @solana/wallet-adapter-react |
| Sui Wallet | @mysten/dapp-kit |
| Cross-chain Routing | LI.FI SDK v4 |
| EVM Contract | Solidity, Hardhat/Foundry |
| Solana Program | Anchor (Rust) |
| Sui Module | Move |
| Database | Supabase (Postgres + Realtime + Edge Functions) |
| Indexing | Alchemy Webhooks (EVM), Helius Webhooks (Solana), Sui Event Subscription |
| Hosting | Vercel (frontend), Supabase (backend) |

## Phased Rollout

### Phase 1: Fix Current Prototype (1-2 weeks)
- Fix schema drift between migrations and edge functions
- Fix TypeScript errors (CheckoutClient.tsx chain type)
- Align record-transaction with latest schema
- Get end-to-end flow working on testnets (Base Sepolia + Solana Devnet + Sui Testnet)

### Phase 2: Smart Contract Escrow (2-3 weeks)
- Write and deploy EVM escrow on Base Sepolia
- Write and deploy Solana program on devnet
- Write and deploy Sui module on testnet
- Update frontend to route payments through contracts
- Update webhooks to listen for contract events

### Phase 3: Cross-Chain via LI.FI + Escrow (1-2 weeks)
- Configure LI.FI to route bridge outputs to escrow contract address
- Handle bridge completion verification
- Add slippage protection and minimum amount checks

### Phase 4: Production Polish (1-2 weeks)
- Deploy contracts to mainnets
- Add permanent link types (tip jar, recurring)
- Premium tier / API key system
- Email notifications
- Dashboard with real-time updates via Supabase Realtime

### Phase 5: Scale (ongoing)
- Add more chains (Arbitrum, Polygon, Optimism via EVM escrow)
- Fiat on/off ramp integration
- Widget/embed SDK for merchants
- Mobile-optimized checkout
