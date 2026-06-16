import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'

const endpoint = typeof window !== 'undefined' 
  ? '/api/rpc/base' 
  : 'https://mainnet.base.org';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(endpoint),
  },
})
