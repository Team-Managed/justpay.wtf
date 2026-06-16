import { supabase } from '@/lib/supabase'
import { PaymentCard } from '@/components/PaymentCard'
import { CheckoutClient } from './CheckoutClient'
import { notFound } from 'next/navigation'

export default async function PaymentPage({ params }: { params: Promise<{ linkId: string }> }) {
  const resolvedParams = await params;
  const { data: link } = await supabase
    .from('payment_links')
    .select('*')
    .eq('short_code', resolvedParams.linkId)
    .single()

  if (!link) {
    notFound()
  }

  const isExpired = link.expires_at ? new Date(link.expires_at) < new Date() : false;
  const isCancelled = link.status === 'cancelled';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        <PaymentCard 
          amount={link.amount}
          tokenSymbol={link.token_symbol}
          recipientAddress={link.creator_address}
          memo={link.label}
        />

        <div className="glass-card p-6 w-full">
          {isExpired || isCancelled ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-6 border border-error/20 bg-error/5 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center mb-2">
                <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center text-white font-bold text-lg">!</div>
              </div>
              <h2 className="text-xl font-bold text-error">Payment Unavailable</h2>
              <p className="text-zinc-400 text-sm max-w-xs">
                {isExpired ? "This payment link has expired." : "This payment link was deactivated by the creator."}
              </p>
            </div>
          ) : (
            <CheckoutClient 
              linkId={link.id}
              chain={link.creator_chain}
              recipientAddress={link.creator_address}
              tokenSymbol={link.token_symbol}
              amount={link.amount.toString()}
            />
          )}
        </div>
      </div>
    </main>
  )
}
