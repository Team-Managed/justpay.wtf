-- Migration 002: Schema Updates for Payout Destinations and Rate Limiting

-- 1. Add IP address to payment_links for rate limiting
ALTER TABLE payment_links ADD COLUMN creator_ip VARCHAR(45);

-- 2. Add extra fields for P0 tasks to payment_links
-- memo is already there from 001. expires_at is already there.
ALTER TABLE payment_links ADD COLUMN payout_destination_id UUID;

-- 3. Modify payment_links status enum to include cancelled
ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE payment_links ADD CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'expired', 'cancelled'));

-- 4. Create payout_destinations table (TASK-005)
CREATE TABLE payout_destinations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_address VARCHAR(64) NOT NULL, -- The connected wallet managing this destination
  chain_family    VARCHAR(10) NOT NULL, -- 'ethereum' or 'solana'
  address         VARCHAR(64) NOT NULL, -- The destination address
  is_default      BOOLEAN DEFAULT false,
  verified_at     TIMESTAMPTZ,          -- Timestamp when signed message was verified
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_chain_family CHECK (chain_family IN ('ethereum', 'solana'))
);

CREATE INDEX idx_payout_dest_creator ON payout_destinations(creator_address);
CREATE INDEX idx_payout_dest_address ON payout_destinations(address);

-- RLS
ALTER TABLE payout_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read verified payout destinations"
  ON payout_destinations FOR SELECT
  USING (verified_at IS NOT NULL);

CREATE POLICY "Service role insert payout destinations"
  ON payout_destinations FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update payout destinations"
  ON payout_destinations FOR UPDATE
  USING (auth.role() = 'service_role');
