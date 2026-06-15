'use client'

import { useState } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { executeEVMTransfer } from '@/lib/web3/executeEVM'
import { executeSolanaTransfer } from '@/lib/web3/executeSolana'
import { Loader2 } from 'lucide-react'

interface SmartButtonProps {
  linkId: string
  chain: 'ethereum' | 'solana'
  recipientAddress: string
  tokenAddress: string | null
  amount: string
  decimals?: number
  onSuccess: (txHash: string) => void
}

export function SmartButton({ 
  linkId, 
  chain, 
  recipientAddress, 
  tokenAddress, 
  amount, 
  decimals = 18,
  onSuccess 
}: SmartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Wagmi
  const { address: evmAddress } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  
  // Solana
  const wallet = useWallet()
  const { connection } = useConnection()

  const handleExecute = async () => {
    setIsLoading(true)
    try {
      let txHash: string

      if (chain === 'ethereum') {
        if (!evmAddress) throw new Error('EVM Wallet not connected')
        txHash = await executeEVMTransfer({
          sendTransactionAsync,
          tokenAddress,
          recipientAddress: recipientAddress as `0x${string}`,
          amount,
          decimals
        })
      } else {
        if (!wallet.publicKey) throw new Error('Solana Wallet not connected')
        txHash = await executeSolanaTransfer({
          wallet,
          connection,
          tokenAddress,
          recipientAddress,
          amount,
          decimals
        })
      }

      // Record the transaction intent to Supabase edge function
      const payerAddress = chain === 'ethereum' ? evmAddress : wallet.publicKey?.toBase58()
      const idempotencyKey = crypto.randomUUID()
      
      const res = await fetch('https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/functions/v1/record-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          idempotencyKey,
          payerAddress,
          payerChain: chain,
          txHash,
          amountPaid: parseFloat(amount),
          tokenPaid: tokenAddress ? 'ERC20/SPL' : 'NATIVE'
        })
      })

      if (!res.ok) {
        console.warn('Transaction sent but intent log failed:', await res.text())
      }

      onSuccess(txHash)
      
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const isReady = chain === 'ethereum' ? !!evmAddress : !!wallet.publicKey

  return (
    <button
      onClick={handleExecute}
      disabled={isLoading || !isReady}
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/25"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Confirming in Wallet...
        </>
      ) : (
        `Pay ${amount}`
      )}
    </button>
  )
}
