import { parseEther } from 'viem'
import { Connection, PublicKey, SystemProgram, Transaction as SolanaTransaction } from '@solana/web3.js'
import { Transaction } from '@mysten/sui/transactions'

export async function createDirectTransferNativeTx({
  chain,
  payerAddress,
  recipientAddress,
  amountBase,
}: {
  chain: string
  payerAddress: string
  recipientAddress: string
  amountBase: string
}) {
  if (chain === 'ethereum' || chain === 'base' || chain === 'sepolia' || chain === 'baseSepolia') {
    // Return parameters for wagmi's sendTransaction
    return {
      to: recipientAddress as `0x${string}`,
      value: BigInt(amountBase),
    }
  } 
  
  if (chain === 'solana' || chain === 'solanaDevnet') {
    const tx = new SolanaTransaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(payerAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: BigInt(amountBase),
      })
    )
    return tx;
  }
  
  if (chain === 'sui' || chain === 'suiTestnet') {
    const tx = new Transaction()
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountBase)])
    tx.transferObjects([coin], tx.pure.address(recipientAddress))
    return tx;
  }

  throw new Error(`Direct transfer fallback not implemented for ${chain}`);
}
