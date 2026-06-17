export type ChainSponsorshipPolicy = {
  chain: 'ethereum' | 'solana' | 'base' | 'arbitrum' | 'optimism' | 'sui';
  gasSponsored: boolean;
};

export const chainPolicies: Record<string, ChainSponsorshipPolicy> = {
  solana: {
    chain: 'solana',
    gasSponsored: false,
  },
  base: {
    chain: 'base',
    gasSponsored: false,
  },
  ethereum: {
    chain: 'ethereum',
    gasSponsored: false,
  },
  sui: {
    chain: 'sui',
    gasSponsored: false,
  }
};

export function getPolicy(chain: string): ChainSponsorshipPolicy {
  return chainPolicies[chain] || { chain: chain as any, gasSponsored: false };
}

export const SUI_CHAIN_CONFIG = {
  id: 'sui',
  label: 'Sui',
  network: 'testnet',
  nativeToken: 'SUI',
  nativeTokenDecimals: 9,
  explorerUrl: 'https://suiexplorer.com',
  rpcUrl: 'https://fullnode.testnet.sui.io:443',
  webhookType: 'polling' as const,
  confirmationStrategy: 'finalized' as const,
  minGasBuffer: 0.01,
};
