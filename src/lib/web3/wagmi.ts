import { http, createConfig } from 'wagmi'
import { mainnet, base, arbitrum, optimism } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET ?? 'https://eth-mainnet.g.alchemy.com/v2/demo'),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})
