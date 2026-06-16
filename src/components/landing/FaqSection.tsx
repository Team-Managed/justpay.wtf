'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

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
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-zinc-400">Everything you need to know about how we route your payments.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className={`glass-card overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary/50' : 'border-border'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold text-foreground">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <div 
                  className={`px-6 text-zinc-400 transition-all duration-300 ease-in-out ${isOpen ? 'pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  {faq.answer}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
