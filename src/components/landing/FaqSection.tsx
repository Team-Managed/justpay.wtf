'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { BlockReveal } from '@/components/animations/BlockReveal'

const faqs = [
  {
    question: 'Is justpay.wtf really non-custodial?',
    answer: 'Yes. We never hold your funds. Payments are routed directly from the payer to the recipient using decentralized liquidity networks. We cannot freeze, block, or access your money.'
  },
  {
    question: 'What happens if a cross-chain swap fails?',
    answer: 'If a transaction fails before it is broadcast, you lose nothing. If it reverts on-chain due to high slippage, your funds remain in your wallet (minus the small network gas fee). We use exact-out routing to ensure the recipient always gets the exact requested amount if the transaction succeeds.'
  },
  {
    question: 'Which wallets and chains are supported?',
    answer: 'Currently we support EVM wallets (MetaMask, Rainbow, Coinbase Wallet) paying on Base, as well as Solana wallets (Phantom, Solflare).'
  },
  {
    question: 'Are there any platform fees?',
    answer: 'No. justpay.wtf charges $0.00 in platform fees. The payer is only responsible for the standard network gas fees and any liquidity provider fees (slippage) incurred during cross-chain swaps.'
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="w-full bg-[var(--color-neutral-primary-soft)] border-b-2 border-[var(--color-border-default)] py-[96px]">
      <div className="max-w-[1200px] mx-auto px-[24px] flex flex-col gap-12">
        <div className="flex flex-col gap-4 text-left items-start">
          <h2 className="text-[16px] font-bold text-[var(--color-section-brand)] uppercase tracking-widest border-2 border-[var(--color-border-default)] px-4 py-1 bg-[var(--color-neutral-primary-soft)] inline-block w-max">Information</h2>
          <BlockReveal blockColor="var(--color-section-pink)">
            <h2 className="text-[48px] md:text-[64px] font-black text-black leading-[0.95] tracking-tighter uppercase mb-4">
              Got Questions?
            </h2>
          </BlockReveal>
          <p className="text-[20px] font-bold text-black border-b-4 border-black pb-2 inline-block w-max max-w-full">
            Everything you need to know about how we route your payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className={`bg-[var(--color-neutral-secondary-soft)] border-4 border-black transition-all duration-300 ${isOpen ? 'shadow-[var(--shadow-md)] bg-[var(--color-section-yellow)]' : 'hover:bg-[var(--color-section-cyan)] hover:shadow-[var(--shadow-xs)]'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <span className="text-[24px] font-black text-black uppercase pr-4">{faq.question}</span>
                  <div className="bg-white border-2 border-black w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-xs)]">
                    {isOpen ? <Minus className="w-5 h-5 text-black" strokeWidth={3} /> : <Plus className="w-5 h-5 text-black" strokeWidth={3} />}
                  </div>
                </button>
                <div 
                  className={`px-6 text-[18px] font-bold text-black transition-all duration-300 ease-in-out ${isOpen ? 'pb-6 opacity-100 max-h-[500px]' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  <p className="border-t-2 border-black pt-4">{faq.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
