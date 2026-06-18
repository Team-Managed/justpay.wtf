CREATE TABLE payment_links (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code      VARCHAR(10) UNIQUE NOT NULL,       -- nanoid 8-char, indexed for O(1) lookups
  idempotency_key VARCHAR(36) UNIQUE NOT NULL,       -- client-generated UUID, prevents double-click duplicates
  
  -- Creator info (no auth required)
  creator_address VARCHAR(64) NOT NULL,              -- wallet address or manual input
  creator_chain   VARCHAR(10) NOT NULL,              -- 'ethereum' | 'solana'
  creator_email   VARCHAR(255),                      -- optional, for Resend email notifications
  
  -- Payment details (no fees — direct wallet-to-wallet)
  token_symbol    VARCHAR(10) NOT NULL,              -- 'ETH', 'SOL', 'USDC', etc.
  token_address   VARCHAR(64),                       -- contract/mint address (null for native)
  amount          DECIMAL(36,18) NOT NULL,            -- requested amount
  
  -- Metadata
  label           VARCHAR(100),                      -- "Coffee payment", "Invoice #123"
  memo            TEXT,                              -- optional note
  
  -- Status & tracking
  status          VARCHAR(20) DEFAULT 'active',
  expires_at      TIMESTAMPTZ,                       -- optional expiry
  created_at      TIMESTAMPTZ DEFAULT now(),
  view_count      INTEGER DEFAULT 0,
  
  CONSTRAINT valid_chain CHECK (creator_chain IN ('ethereum', 'solana')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'expired'))
);

CREATE INDEX idx_short_code ON payment_links(short_code);
CREATE INDEX idx_creator ON payment_links(creator_address);
CREATE INDEX idx_status ON payment_links(status);
CREATE INDEX idx_expires ON payment_links(expires_at) WHERE expires_at IS NOT NULL;

-- RLS: public read for active/completed links, service_role-only writes
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active links"
  ON payment_links FOR SELECT
  USING (status IN ('active', 'completed'));

CREATE POLICY "Service role insert links"
  ON payment_links FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update links"
  ON payment_links FOR UPDATE
  USING (auth.role() = 'service_role');


CREATE TABLE transactions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id         UUID REFERENCES payment_links(id) ON DELETE CASCADE,
  idempotency_key VARCHAR(36) UNIQUE NOT NULL,        -- client-generated, prevents duplicate tx records
  
  -- Payer info
  payer_address   VARCHAR(64) NOT NULL,
  payer_chain     VARCHAR(10) NOT NULL,
  
  -- Transaction details
  tx_hash         VARCHAR(128) UNIQUE NOT NULL,       -- on-chain tx hash
  amount_paid     DECIMAL(36,18) NOT NULL,
  token_paid      VARCHAR(10) NOT NULL,               -- what the payer actually sent
  
  -- Swap info (if applicable)
  was_swapped     BOOLEAN DEFAULT false,
  swap_from_token VARCHAR(10),
  swap_provider   VARCHAR(50),                        -- 'jupiter', '0x'
  
  -- Bridge tracking (separate from payment tx — bridges take 2-20 min)
  bridge_tx_hash    VARCHAR(128) UNIQUE,              -- bridge-specific tx hash for status polling
  bridge_status     VARCHAR(20),                      -- 'bridging', 'bridge_complete', 'bridge_failed'
  bridge_provider   VARCHAR(50),                      -- 'mayan', 'allbridge', 'wormhole'
  bridge_started_at TIMESTAMPTZ,
  bridge_settled_at TIMESTAMPTZ,
  
  -- Status
  status          VARCHAR(20) DEFAULT 'pending',
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_tx_status CHECK (status IN ('pending', 'confirmed', 'failed')),
  CONSTRAINT valid_bridge_status CHECK (
    bridge_status IS NULL OR bridge_status IN ('bridging', 'bridge_complete', 'bridge_failed')
  )
);

CREATE INDEX idx_link_id ON transactions(link_id);
CREATE INDEX idx_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_pending ON transactions(status, created_at) WHERE status = 'pending';
CREATE INDEX idx_bridging ON transactions(bridge_status) WHERE bridge_status = 'bridging';

-- RLS: public read for status display, service_role-only writes
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read transactions"
  ON transactions FOR SELECT USING (true);

CREATE POLICY "Service role insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update transactions"
  ON transactions FOR UPDATE
  USING (auth.role() = 'service_role');


CREATE TABLE token_prices (
  id            VARCHAR(20) PRIMARY KEY,             -- 'ETH', 'SOL', 'USDC', etc.
  price_usd     DECIMAL(20,8) NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE token_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read prices" ON token_prices FOR SELECT USING (true);
CREATE POLICY "Service role write prices" ON token_prices FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role update prices" ON token_prices FOR UPDATE USING (auth.role() = 'service_role');


CREATE TABLE email_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id       UUID REFERENCES payment_links(id) ON DELETE CASCADE,
  tx_id         UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  -- Delivery info
  to_email      VARCHAR(255) NOT NULL,
  template      VARCHAR(30) NOT NULL,                -- 'payment_received', 'bridge_started', 'bridge_settled', 'link_expired'
  resend_id     VARCHAR(64),                         -- Resend message ID for deliverability tracking
  status        VARCHAR(20) DEFAULT 'sent',          -- 'sent', 'delivered', 'bounced', 'failed'
  
  created_at    TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_template CHECK (
    template IN ('payment_received', 'bridge_started', 'bridge_settled', 'link_expired')
  )
);

CREATE INDEX idx_email_link ON email_logs(link_id);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON email_logs
  USING (auth.role() = 'service_role');
