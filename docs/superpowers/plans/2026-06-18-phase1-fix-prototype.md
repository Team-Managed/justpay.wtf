# Phase 1: Fix Current Prototype — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get the existing prototype working end-to-end on testnets (Base Sepolia + Solana Devnet + Sui Testnet) by fixing schema drift, TypeScript errors, and broken edge function queries.

**Architecture:** Keep current architecture (Supabase + Next.js + LI.FI), but align all code to the latest migration schema and fix type mismatches. This phase produces a testable baseline before Phase 2 introduces smart contracts.

**Tech Stack:** Next.js 16, TypeScript, Supabase Edge Functions (Deno), @solana/web3.js, wagmi/viem, @mysten/sui, LI.FI SDK v4

---

### Task 1: Fix CheckoutClient TypeScript Error

**Files:**
- Modify: `src/app/[linkId]/CheckoutClient.tsx`
- Modify: `src/app/[linkId]/page.tsx`

The `chain` prop type is `'ethereum' | 'solana' | 'sui'` but the code compares it to `'base'`, `'sepolia'`, `'baseSepolia'`. The issue is that the page passes the raw `destination_chain` from the DB which can only be those 3 values, but the component logic expects EVM sub-chains.

- [ ] **Step 1: Update CheckoutClient props type and initial state logic**

Change the `chain` prop to accept all valid destination chains from the network config, and fix the comparison:

```tsx
// src/app/[linkId]/CheckoutClient.tsx
interface CheckoutClientProps {
  linkId: string
  chain: string  // destination chain key from network config
  recipientAddress: string
  tokenSymbol: string
  amount: string
}

export function CheckoutClient({ linkId, chain, recipientAddress, tokenSymbol, amount }: CheckoutClientProps) {
  const isDestTestnet = getChainConfig(chain)?.isTestnet;
  const chainFamily = getChainConfig(chain)?.family;
  
  const [payerChain, setPayerChain] = useState<string>(
    chainFamily === 'ethereum'
      ? chain 
      : (isDestTestnet ? 'sepolia' : 'ethereum')
  )
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm build 2>&1 | grep -A2 "Type error"` 
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/app/[linkId]/CheckoutClient.tsx
git commit -m "fix: CheckoutClient chain type comparison error"
```

---

### Task 2: Consolidate Database Schema

**Files:**
- Create: `supabase/migrations/20240618000001_schema_consolidation.sql`

The current schema has drift between what migrations expect and what edge functions write. Create a migration that explicitly sets the final column names.

- [ ] **Step 1: Write consolidation migration**

```sql
-- 20240618000001_schema_consolidation.sql
-- Consolidate schema to final column naming convention

-- Ensure payment_links has correct columns
DO $$ BEGIN
  -- Add link_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_links' AND column_name='link_type') THEN
    ALTER TABLE payment_links ADD COLUMN link_type VARCHAR(20) DEFAULT 'invoice';
  END IF;
  
  -- Ensure destination_chain exists (was creator_chain)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_links' AND column_name='creator_chain') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_links' AND column_name='destination_chain') THEN
    ALTER TABLE payment_links RENAME COLUMN creator_chain TO destination_chain;
  END IF;
  
  -- Ensure destination columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_links' AND column_name='creator_address') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_links' AND column_name='merchant_address') THEN
    ALTER TABLE payment_links RENAME COLUMN creator_address TO merchant_address;
  END IF;
  
  -- Add merchant_email alias
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_links' AND column_name='merchant_email') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_links' AND column_name='creator_email') THEN
      ALTER TABLE payment_links RENAME COLUMN creator_email TO merchant_email;
    ELSE
      ALTER TABLE payment_links ADD COLUMN merchant_email VARCHAR(255);
    END IF;
  END IF;
END $$;

-- Ensure transactions has correct columns
DO $$ BEGIN
  -- Rename payer_chain -> source_chain if old name still exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='payer_chain') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='source_chain') THEN
    ALTER TABLE payment_links RENAME COLUMN payer_chain TO source_chain;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='tx_hash') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='source_tx_hash') THEN
    ALTER TABLE transactions RENAME COLUMN tx_hash TO source_tx_hash;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='token_paid') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='source_token') THEN
    ALTER TABLE transactions RENAME COLUMN token_paid TO source_token;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='amount_paid') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='source_amount') THEN
    ALTER TABLE transactions RENAME COLUMN amount_paid TO source_amount;
  END IF;
  
  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='destination_tx_hash') THEN
    ALTER TABLE transactions ADD COLUMN destination_tx_hash VARCHAR(128);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='destination_amount') THEN
    ALTER TABLE transactions ADD COLUMN destination_amount DECIMAL(28,18);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='protocol_fee') THEN
    ALTER TABLE transactions ADD COLUMN protocol_fee DECIMAL(28,18) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='lifi_route_id') THEN
    ALTER TABLE transactions ADD COLUMN lifi_route_id VARCHAR(128);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='confirmed_at') THEN
    ALTER TABLE transactions ADD COLUMN confirmed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Update status constraint on transactions to include all valid states
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
  CHECK (status IN ('pending', 'bridging', 'confirmed', 'failed', 'refunded'));

-- Update status constraint on payment_links
ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS payment_links_status_check;
ALTER TABLE payment_links ADD CONSTRAINT payment_links_status_check 
  CHECK (status IN ('active', 'completed', 'expired', 'cancelled', 'pending', 'bridging', 'partial', 'failed'));
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20240618000001_schema_consolidation.sql
git commit -m "fix: consolidate DB schema with final column names and constraints"
```

---

### Task 3: Fix record-transaction Edge Function

**Files:**
- Modify: `supabase/functions/record-transaction/index.ts`

This function writes old column names. Update to match consolidated schema.

- [ ] **Step 1: Update column names in the insert**

The function currently inserts `payer_chain`, `tx_hash`, `token_paid`, `amount_paid`. Update to `source_chain`, `source_tx_hash`, `source_token`, `source_amount`.

```typescript
// supabase/functions/record-transaction/index.ts
// In the insert call, change the column mapping:
const { data, error } = await supabase
  .from('transactions')
  .insert({
    link_id: body.link_id,
    payer_address: body.payer_address,
    source_chain: body.payer_chain,
    source_tx_hash: body.tx_hash,
    source_token: body.token_symbol,
    source_amount: body.amount,
    lifi_route_id: body.lifi_route_id || null,
    status: 'pending',
  })
  .select()
  .single();
```

- [ ] **Step 2: Test locally with Supabase CLI**

Run: `supabase functions serve record-transaction --env-file .env.local`
Expected: Function starts without import errors

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/record-transaction/index.ts
git commit -m "fix: align record-transaction with consolidated schema column names"
```

---

### Task 4: Fix Webhook Functions

**Files:**
- Modify: `supabase/functions/alchemy-webhook/index.ts`
- Modify: `supabase/functions/helius-webhook/index.ts`

Both webhooks query old column names (`tx_hash`, `email_alert`).

- [ ] **Step 1: Update alchemy-webhook queries**

Replace `tx_hash` references with `source_tx_hash`, update payment_links queries to use `merchant_email` instead of `email_alert`:

```typescript
// In alchemy-webhook/index.ts, update the transaction lookup:
const { data: txRecord } = await supabase
  .from('transactions')
  .select('id, link_id, status')
  .eq('source_tx_hash', txHash)
  .single();

// Update the payment_links query:
const { data: link } = await supabase
  .from('payment_links')
  .select('id, merchant_email, merchant_address, status')
  .eq('id', txRecord.link_id)
  .single();
```

- [ ] **Step 2: Update helius-webhook queries identically**

Same pattern — replace `tx_hash` with `source_tx_hash` and `email_alert` with `merchant_email`.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/alchemy-webhook/index.ts supabase/functions/helius-webhook/index.ts
git commit -m "fix: align webhook functions with consolidated schema"
```

---

### Task 5: Fix LI.FI Verifier

**Files:**
- Modify: `supabase/functions/shared/lifi-verifier.ts`

The verifier references `source_tx_hash`, `source_chain` (correct) but writes to `email_logs` with wrong columns and updates transaction status to `bridging` which was previously invalid (now fixed by Task 2).

- [ ] **Step 1: Fix email_logs insert to use correct schema**

The base migration defines email_logs with `to_email` and `template`. Update the verifier:

```typescript
// In shared/lifi-verifier.ts, fix the email notification insert:
await supabase.from('email_logs').insert({
  to_email: link.merchant_email,
  template: 'payment_confirmed',
  link_id: transaction.link_id,
  sent_at: new Date().toISOString(),
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/shared/lifi-verifier.ts
git commit -m "fix: align lifi-verifier with email_logs schema"
```

---

### Task 6: Fix create-link Edge Function

**Files:**
- Modify: `supabase/functions/create-link/index.ts`

This function inserts with old column names (`creator_address`, `creator_chain`, `creator_email`).

- [ ] **Step 1: Update insert to use new column names**

```typescript
// In create-link/index.ts, update the insert:
const { data, error } = await supabase
  .from('payment_links')
  .insert({
    short_code: shortCode,
    merchant_address: body.creatorAddress,
    destination_chain: body.creatorChain,
    destination_token_symbol: body.tokenSymbol,
    destination_token_address: body.tokenAddress || null,
    amount: body.amount,
    merchant_email: body.creatorEmail || null,
    memo: body.memo || null,
    label: body.label || null,
    expires_at: body.expiresAt || null,
    link_type: 'invoice',
    status: 'active',
  })
  .select()
  .single();
```

- [ ] **Step 2: Update the response to use consistent naming**

Ensure the response returns `short_code` field properly.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/create-link/index.ts
git commit -m "fix: align create-link with consolidated schema"
```

---

### Task 7: Fix Frontend payment.ts and Dashboard Queries

**Files:**
- Modify: `src/lib/payment.ts`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/history/page.tsx`
- Modify: `src/app/[linkId]/page.tsx`

- [ ] **Step 1: Update payment.ts field mapping**

Ensure the request body sent to create-link matches what the edge function expects.

- [ ] **Step 2: Update dashboard page queries**

Change `creator_address` → `merchant_address`, `amount_paid` → `source_amount`, `token_paid` → `source_token` in Supabase queries.

```typescript
// src/app/dashboard/page.tsx
const { data: links } = await supabase
  .from('payment_links')
  .select('id, amount, status, created_at')
  .eq('merchant_address', address);

// For transactions
const { data: txs } = await supabase
  .from('transactions')
  .select('id, source_amount, status, created_at, source_token')
  .in('link_id', linkIds);
```

- [ ] **Step 3: Update history page queries**

```typescript
// src/app/dashboard/history/page.tsx
const { data } = await supabase
  .from('transactions')
  .select(`
    id, source_tx_hash, source_amount, source_token,
    source_chain, status, created_at,
    payment_links!inner(short_code, merchant_address)
  `)
  .eq('payment_links.merchant_address', address)
  .order('created_at', { ascending: false });
```

- [ ] **Step 4: Update [linkId]/page.tsx fetch to use new column names**

Ensure the server-side fetch from Supabase uses `merchant_address`, `destination_chain`, `destination_token_symbol`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/payment.ts src/app/dashboard/page.tsx src/app/dashboard/history/page.tsx src/app/[linkId]/page.tsx
git commit -m "fix: align frontend queries with consolidated schema"
```

---

### Task 8: Fix LI.FI Router Type Issue

**Files:**
- Modify: `src/lib/web3/router/lifi.ts`

The `LifiQuoteParams` interface is missing `fromChain` but the implementation uses it.

- [ ] **Step 1: Add fromChain to the interface**

```typescript
export interface LifiQuoteParams {
  fromChain: string;       // chain key for payer
  fromToken: string;       // token address payer sends
  toChain: string;         // destination chain key
  toToken: string;         // destination token address
  destinationAmountBase: string; // exact amount needed (in base units)
  fromAddress: string;     // payer wallet address
  toAddress: string;       // merchant wallet address
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/web3/router/lifi.ts
git commit -m "fix: add missing fromChain to LifiQuoteParams interface"
```

---

### Task 9: Remove Unused Code

**Files:**
- Delete: `src/hooks/usePaymentState.ts`

- [ ] **Step 1: Verify no imports exist**

Run: `grep -r "usePaymentState" src/`
Expected: No results (confirming it's unused)

- [ ] **Step 2: Remove the file**

```bash
rm src/hooks/usePaymentState.ts
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused usePaymentState hook"
```

---

### Task 10: Verify End-to-End Build

- [ ] **Step 1: Run full build**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No critical errors

- [ ] **Step 3: Final commit and push**

```bash
git push origin main
```

---

## Post-Phase 1 Notes

After this phase completes, the app should:
- Build without TypeScript errors
- Have consistent schema between migrations, edge functions, and frontend queries
- Support creating links and viewing them in the dashboard
- Route payments through LI.FI or direct transfer on testnets

The **next phase** (Phase 2) introduces smart contract escrow, which will replace the "trust the payer sent to the right address" model with on-chain verification and fee collection. See `docs/superpowers/specs/2026-06-18-justpay-v2-design.md` for the full roadmap.
