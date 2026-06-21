'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config, connectors } from '@/lib/web3/wagmi'
import { useSyncWagmiConfig } from '@lifi/widget-provider-ethereum'
import { EthereumProvider } from '@lifi/widget-provider-ethereum'
import { SolanaProvider } from '@lifi/widget-provider-solana'
import { SuiProvider } from '@lifi/widget-provider-sui'
import { WalletManagementProviders } from '@lifi/wallet-management'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { getChains, createClient, ChainType } from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

// Solana wallet adapter — ConnectionProvider kept for SmartButton.tsx which uses
// useConnection() for direct Solana transaction execution.
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'

const queryClient = new QueryClient()

const lifiClient = createClient({ integrator: 'justpay', disableVersionCheck: true })

// Widget providers for WalletManagementProviders — enables openWalletMenu() throughout the app.
// EthereumProvider auto-detects our existing WagmiContext and reuses it (no duplication).
// SolanaProvider uses Wallet Standard for wallet discovery.
// SuiProvider uses @mysten/dapp-kit-react Wallet Standard for Sui wallets (Slush, etc).
const walletProviders = [EthereumProvider(), SolanaProvider(), SuiProvider()]

// Minimal MUI theme — required by WalletMenuModal which uses theme.vars.palette.
// cssVariables: true is needed so theme.vars is populated (MUI v9 sets vars=null without it).
// colorSchemes: { dark: true } enables the dark palette that @lifi/wallet-management expects.
const muiTheme = createTheme({ cssVariables: true, colorSchemes: { dark: true } })

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
  const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
  const solanaEndpoint = useMemo(() =>
    isTestnet
      ? 'https://api.devnet.solana.com'
      : typeof window !== 'undefined'
        ? window.location.origin + '/api/rpc/solana'
        : 'https://api.mainnet-beta.solana.com',
    [isTestnet]
  )
  const wallets = useMemo(() => [], [])
  const onError = useCallback((error: Error) => { console.error(error) }, [])

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <ChainSyncer />
        <ThemeProvider theme={muiTheme}>
          <WalletManagementProviders providers={walletProviders}>
            <ConnectionProvider endpoint={solanaEndpoint}>
              <SolanaWalletProvider wallets={wallets} autoConnect={false} onError={onError}>
                {children}
              </SolanaWalletProvider>
            </ConnectionProvider>
          </WalletManagementProviders>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
