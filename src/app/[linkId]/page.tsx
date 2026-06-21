// No 'use client' — this is a Server Component
import { fetchQuery } from 'convex/nextjs'
import { api } from '../../../convex/_generated/api'
import { PaymentCard } from '@/components/PaymentCard'
import { CheckoutClient } from './CheckoutClient'
import { ExpiryBadge } from '@/components/ExpiryBadge'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ linkId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { linkId } = await params
  try {
    const link = await fetchQuery(api.links.getLinkByShortCode, { shortCode: linkId })
    if (!link) return { title: 'Payment Link — justpay.wtf' }

    const tokenPart = link.destinationTokenSymbol ?? 'crypto'
    const chainPart = link.destinationChain ? ` on chain ${link.destinationChain}` : ''
    const amountLabel = link.amount ? `${link.amount} ${tokenPart}` : tokenPart
    const shortAddr = link.receiverAddress.slice(0, 8) + '…'
    return {
      title: `Pay ${amountLabel}${chainPart} — justpay.wtf`,
      description: link.note ?? `Send ${amountLabel} to ${shortAddr}`,
      openGraph: {
        title: `Pay ${amountLabel}`,
        description: link.note ?? `Cross-chain payment powered by justpay.wtf`,
        siteName: 'justpay.wtf',
      },
    }
  } catch {
    return { title: 'Payment Link — justpay.wtf' }
  }
}

export default async function PaymentPage({ params }: Props) {
  const { linkId } = await params
  const link = await fetchQuery(api.links.getLinkByShortCode, { shortCode: linkId })

  if (!link) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-bold text-black uppercase">Payment link not found.</p>
      </main>
    )
  }

  const isExpired = link.expiresAt ? link.expiresAt < Date.now() : false
  const isUnavailable = isExpired || link.status === 'cancelled'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[var(--color-neutral-primary-soft)] border-x-2 border-black max-w-7xl mx-auto shadow-[var(--shadow-lg)]">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_19px,var(--color-border-default)_20px),linear-gradient(90deg,transparent_19px,var(--color-border-default)_20px)] bg-[length:40px_40px] opacity-[0.15] pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        <PaymentCard
          amount={Number(link.amount) || 0}
          tokenSymbol={link.destinationTokenSymbol ?? 'any token'}
          recipientAddress={link.receiverAddress}
          memo={link.note}
        />

        <div className="bg-[var(--color-neutral-secondary-soft)] border-4 border-black p-6 w-full shadow-[6px_6px_0px_0px_var(--color-section-pink)]">
          {isUnavailable ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-8 border-4 border-black bg-[var(--color-danger)] text-white">
              <div className="w-12 h-12 bg-white flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black text-2xl text-black">!</span>
              </div>
              <h2 className="text-2xl font-black uppercase">Payment Unavailable</h2>
              <p className="font-bold text-white max-w-xs">
                {isExpired ? 'This payment link has expired.' : 'This payment link was deactivated by the creator.'}
              </p>
            </div>
          ) : (
            <>
              {link.expiresAt && <ExpiryBadge expiresAt={link.expiresAt} />}
              <CheckoutClient
                linkId={link._id}
                receiverAddress={link.receiverAddress}
                destinationChain={link.destinationChain}
                destinationTokenSymbol={link.destinationTokenSymbol}
                destinationTokenAddress={link.destinationTokenAddress}
                amount={link.amount}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
