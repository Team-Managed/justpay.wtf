'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config, connectors } from '@/lib/web3/wagmi'
import { useSyncWagmiConfig } from '@lifi/widget-provider-ethereum'
import { EthereumProvider } from '@lifi/widget-provider-ethereum'
import { SolanaProvider } from '@lifi/widget-provider-solana'
import { WalletManagementProviders } from '@lifi/wallet-management'
import { getChains, createClient, ChainType } from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

// Sui imports — kept because @lifi/widget-provider-sui requires @mysten/dapp-kit-react
// which conflicts with the @mysten/dapp-kit already installed
import { SuiClientProvider, WalletProvider as SuiWalletProvider } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'

const queryClient = new QueryClient()

const suiNetworks = {
  mainnet: { url: 'https://fullnode.mainnet.sui.io:443', network: 'mainnet' as const },
  testnet: { url: 'https://fullnode.testnet.sui.io:443', network: 'testnet' as const },
}

const lifiClient = createClient({ integrator: 'justpay', disableVersionCheck: true })

// Widget providers passed to WalletManagementProviders.
// EthereumProvider detects our existing WagmiContext and reuses it (no new provider created).
// SolanaProvider uses Wallet Standard — discovers all modern Solana wallets automatically.
const walletProviders = [EthereumProvider(), SolanaProvider()]

function ChainSyncer() {
  const { data: chains } = useQuery({
    queryKey: ['lifi-chains'],
    queryFn: () => getChains(lifiClient, {
      chainTypes: [ChainType.EVM, ChainType.SVM, ChainType.UTXO, ChainType.MVM, ChainType.TVM],
    }),
    staleTime: 1000 * 60 * 60,
    gcTime: Infinity,
  })
  useSyncWagmiConfig(config, connectors, chains ?? [])
  return null
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';
  // Solana RPC — still needed for @mysten/dapp-kit Sui context and any direct Solana reads
  const solanaEndpoint = useMemo(() =>
    isTestnet
      ? 'https://api.devnet.solana.com'
      : typeof window !== 'undefined'
        ? window.location.origin + '/api/rpc/solana'
        : 'https://api.mainnet-beta.solana.com',
    [isTestnet]
  )
  const onSuiError = useCallback((error: Error) => { console.error(error) }, [])

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <ChainSyncer />
        {/* WalletManagementProviders wraps children with LI.FI's wallet picker.
            isExternalContext is not needed — EthereumProvider auto-detects our WagmiContext.
            openWalletMenu() from useWalletMenu() will show the built-in wallet modal. */}
        <WalletManagementProviders providers={walletProviders}>
          {/* Sui kept separate: dapp-kit-react peer dep conflict prevents using SuiProvider() */}
          <SuiClientProvider networks={suiNetworks} defaultNetwork="testnet">
            <SuiWalletProvider autoConnect onError={onSuiError}>
              {children}
            </SuiWalletProvider>
          </SuiClientProvider>
        </WalletManagementProviders>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
