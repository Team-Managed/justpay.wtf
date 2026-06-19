'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { BlockReveal } from '@/components/animations/BlockReveal';

const faqs = [
  {
    question: 'Is justpay.wtf really non-custodial?',
    icon: <ShieldAlert className="w-6 h-6 stroke-black" strokeWidth={3} />,
    answer: 'Yes. We never hold your funds. Payments are routed directly from the payer to the recipient using decentralized liquidity networks. We cannot freeze, block, or access your money.'
  },
  {
    question: 'What happens if a cross-chain swap fails?',
    icon: <Info className="w-6 h-6 stroke-black" strokeWidth={3} />,
    answer: 'If a transaction fails before it is broadcast, you lose nothing. If it reverts on-chain due to high slippage, your funds remain in your wallet (minus the small network gas fee). We use exact-out routing to ensure the recipient always gets the exact requested amount if the transaction succeeds.'
  },
  {
    question: 'Which wallets and chains are supported?',
    icon: <CheckCircle className="w-6 h-6 stroke-black" strokeWidth={3} />,
    answer: 'Currently we support EVM wallets (MetaMask, Rainbow, Coinbase Wallet) paying on Base, as well as Solana wallets (Phantom, Solflare) and Sui wallets on their respective networks.'
  },
  {
    question: 'Are there any platform fees?',
    icon: <HelpCircle className="w-6 h-6 stroke-black" strokeWidth={3} />,
    answer: 'No. justpay.wtf charges 0% in platform fees. The payer is only responsible for the standard network gas fees and any liquidity provider fees (slippage) incurred during cross-chain swaps.'
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full bg-[var(--color-neutral-primary-soft)] border-b-2 border-black py-[96px]">
      <div className="max-w-[700px] mx-auto px-[24px] flex flex-col gap-12 text-black">
        
        <div className="flex flex-col gap-4 text-center items-center">
          <h2 className="text-[16px] font-black text-[var(--color-section-cyan)] uppercase tracking-widest border-2 border-black px-4 py-1 bg-black inline-block w-max shadow-[4px_4px_0_0_#A6FAFF]">
            Information
          </h2>
          <BlockReveal blockColor="var(--color-section-yellow)">
            <h2 className="text-[48px] md:text-[64px] font-black text-black leading-[0.95] tracking-tighter uppercase mb-4 text-center">
              Got Questions?
            </h2>
          </BlockReveal>
        </div>

        <div className="flex flex-col w-full relative z-10 perspective-1000">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            const isFirst = index === 0;
            const isLast = index === faqs.length - 1;
            const isNextOpen = index + 1 === openIndex;
            const isPrevOpen = index - 1 === openIndex;

            // Brutalist twist on the border-radius logic shared
            let borderRadiusClass = "";
            let borderSidesClass = "border-t-[4px] border-x-[4px] border-b-[4px]";

            if (openIndex === null) {
              if (isFirst) borderRadiusClass = "rounded-t-3xl";
              else if (isLast) { borderRadiusClass = "rounded-b-3xl"; borderSidesClass = "border-[4px]"; }
              else borderSidesClass = "border-t-[4px] border-x-[4px] border-b-0"; 
            } else {
              if (isOpen) {
                borderRadiusClass = "rounded-3xl";
                borderSidesClass = "border-[4px]";
              } else if (isPrevOpen && isLast) {
                borderRadiusClass = "rounded-3xl";
                borderSidesClass = "border-[4px]";
              } else if (isNextOpen && isFirst) {
                borderRadiusClass = "rounded-3xl";
                borderSidesClass = "border-[4px]";
              } else if (isPrevOpen) {
                borderRadiusClass = "rounded-t-3xl";
                if (isLast) { borderRadiusClass += " rounded-b-3xl"; borderSidesClass = "border-[4px]"; }
                else borderSidesClass = "border-t-[4px] border-x-[4px] border-b-0";
              } else if (isNextOpen) {
                borderRadiusClass = "rounded-b-3xl";
                borderSidesClass = "border-x-[4px] border-b-[4px] border-t-0";
                if (isFirst) { borderRadiusClass += " rounded-t-3xl"; borderSidesClass = "border-[4px]"; }
              } else {
                if (index < openIndex) {
                  if (isFirst) borderRadiusClass = "rounded-t-3xl";
                  borderSidesClass = "border-t-[4px] border-x-[4px] border-b-0";
                } else {
                  if (isLast) { borderRadiusClass = "rounded-b-3xl"; borderSidesClass = "border-[4px]"; }
                  else borderSidesClass = "border-x-[4px] border-b-0 border-t-[4px]";
                }
              }
            }

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  y: isOpen ? 0 : 0,
                  marginBottom: isOpen ? "16px" : "0px",
                  marginTop: isOpen ? "16px" : "0px",
                  backgroundColor: isOpen ? 'var(--color-section-yellow)' : '#fff',
                  zIndex: isOpen ? 20 : 10
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={`relative border-black overflow-hidden hover:bg-[var(--color-section-cyan)] hover:text-black transition-colors ${borderRadiusClass} ${borderSidesClass} ${
                  isOpen ? 'shadow-[8px_8px_0_0_#000]' : ''
                }`}
              >
                <div 
                  onClick={() => handleToggle(index)}
                  className="flex items-center justify-between px-6 py-6 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-black group-hover:scale-110 transition-transform">
                      {faq.icon}
                    </span>
                    <span className="text-[20px] md:text-[24px] font-black uppercase text-black">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{
                      rotate: isOpen ? 180 : 0,
                      backgroundColor: isOpen ? '#000' : '#fff',
                      color: isOpen ? '#fff' : '#000'
                    }}
                    transition={{ duration: 0.3 }}
                    className="border-[3px] border-black w-8 h-8 flex items-center justify-center flex-shrink-0"
                  >
                    <ChevronDown size={20} className="w-5 h-5" strokeWidth={4} />
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 900,
                        damping: 80,
                        mass: 10,
                      }}
                    >
                      <div className="px-6 pb-6 pt-0 text-[18px] md:text-[20px] font-bold text-black leading-snug">
                        <div className="border-t-[3px] border-black border-dashed pt-5 mt-2">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
