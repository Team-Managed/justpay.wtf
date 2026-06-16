export type ChainSponsorshipPolicy = {
  chain: 'ethereum' | 'solana' | 'base' | 'arbitrum' | 'optimism';
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
  }
};

export function getPolicy(chain: string): ChainSponsorshipPolicy {
  return chainPolicies[chain] || { chain: chain as any, gasSponsored: false };
}
