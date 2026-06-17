'use client'

import { useState } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit'
import { fetchLifiQuote, getLifiChainId } from '@/lib/web3/router/lifi'
import { Loader2 } from 'lucide-react'
import { VersionedTransaction } from '@solana/web3.js'
import { Transaction } from '@mysten/sui/transactions'

interface SmartButtonProps {
  linkId: string
  chain: 'ethereum' | 'solana' | 'sui'
  recipientAddress: string
  tokenAddress: string | null
  payerChain: 'ethereum' | 'solana' | 'sui'
  inputTokenAddress: string | null
  amount: string
  decimals?: number
  onSuccess: (txHash: string, isBridge?: boolean) => void
  onError?: (error: any) => void
}

export function SmartButton({ 
  linkId, 
  chain, 
  recipientAddress, 
  tokenAddress, 
  payerChain,
  inputTokenAddress,
  amount, 
  decimals = 18,
  onSuccess,
  onError
}: SmartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const { address: evmAddress } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  
  const wallet = useWallet()
  const { connection } = useConnection()

  const suiAccount = useCurrentAccount()
  const { mutateAsync: signAndExecuteSui } = useSignAndExecuteTransaction()

  let payerAddress: string | undefined
  if (payerChain === 'ethereum') payerAddress = evmAddress
  else if (payerChain === 'solana') payerAddress = wallet.publicKey?.toBase58()
  else if (payerChain === 'sui') payerAddress = suiAccount?.address

  const handleExecute = async () => {
    setIsLoading(true)
    try {
      if (!payerAddress) throw new Error('Wallet not connected')

      if (payerChain === 'solana' && wallet.publicKey) {
        const solBalance = await connection.getBalance(wallet.publicKey)
        if (solBalance === 0) {
          throw new Error('Insufficient SOL for transaction fees. Please fund your wallet.')
        }
      }

      const isBridge = payerChain !== chain
      
      const amountBase = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals))).toString()

      // 1. Get Quote
      const { quote, fromAmount } = await fetchLifiQuote({
        fromChain: getLifiChainId(payerChain),
        toChain: getLifiChainId(chain),
        fromToken: inputTokenAddress || (payerChain === 'solana' ? '11111111111111111111111111111111' : payerChain === 'sui' ? '0x2::sui::SUI' : '0x0000000000000000000000000000000000000000'),
        toToken: tokenAddress || (chain === 'solana' ? '11111111111111111111111111111111' : chain === 'sui' ? '0x2::sui::SUI' : '0x0000000000000000000000000000000000000000'),
        fromAddress: payerAddress,
        toAddress: recipientAddress,
        destinationAmountBase: amountBase
      })

      if (!quote.transactionRequest) {
        throw new Error('No transaction request returned from LI.FI')
      }

      let txHash: string

      // 2. Execute Transaction
      if (payerChain === 'ethereum') {
        txHash = await sendTransactionAsync({
          to: quote.transactionRequest.to as `0x${string}`,
          data: quote.transactionRequest.data as `0x${string}`,
          value: BigInt(quote.transactionRequest.value || 0),
        })
      } else if (payerChain === 'solana') {
        if (!quote.transactionRequest.data) throw new Error('No tx data');
        const txBuf = Buffer.from(quote.transactionRequest.data, 'base64')
        const transaction = VersionedTransaction.deserialize(txBuf)
        txHash = await wallet.sendTransaction(transaction, connection)
      } else if (payerChain === 'sui') {
        if (!quote.transactionRequest.data) throw new Error('No tx data');
        const txBuf = Buffer.from(quote.transactionRequest.data, 'base64')
        const transaction = Transaction.from(txBuf)
        const result = await signAndExecuteSui({ transaction })
        txHash = result.digest
      } else {
        throw new Error('Unsupported payer chain')
      }

      // Record the transaction intent
      const idempotencyKey = crypto.randomUUID()
      // Use fromAmount to correctly log the actual token quantity paid
      // We assume inputToken decimals. If we don't have it locally, we just use raw fromAmount or a heuristic.
      // We will just store raw string or float representation. 
      // In a production app we'd fetch decimals, but for now we do rough float conversion.
      const fromDecimals = inputTokenAddress ? (payerChain === 'ethereum' && inputTokenAddress !== '0x0000000000000000000000000000000000000000' ? 6 : 18) : 18;
      const amountPaidFloat = Number(fromAmount) / Math.pow(10, fromDecimals);

      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/record-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          idempotencyKey,
          payerAddress,
          payerChain,
          txHash,
          amountPaid: amountPaidFloat,
          tokenPaid: inputTokenAddress || tokenAddress || 'NATIVE',
          wasSwapped: true, // LI.FI abstracts this
          bridgeTxHash: isBridge ? txHash : null,
          bridgeProvider: 'lifi'
        })
      })

      onSuccess(txHash, isBridge)
      
    } catch (error) {
      console.error(error)
      if (onError) {
        onError(error)
      } else {
        alert(error instanceof Error ? error.message : 'Transaction failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isReady = !!payerAddress

  return (
    <button
      onClick={handleExecute}
      disabled={isLoading || !isReady}
      className="btn-primary-lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing with LI.FI...
        </>
      ) : (
        `Pay ${amount} ${payerChain !== chain ? 'Cross-Chain' : ''}`
      )}
    </button>
  )
}
