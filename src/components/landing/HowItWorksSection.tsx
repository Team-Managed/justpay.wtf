import { ArrowUpRight, Link as LinkIcon, CheckCircle2, Copy } from 'lucide-react';
import { BrutalistCard } from '../brutalism/Card';
import { BrutalistButton } from '../brutalism/Button';
import { BlockReveal } from '@/components/animations/BlockReveal';

export function HowItWorksSection() {
  return (
    <div id="how-it-works" className="w-full bg-[var(--color-neutral-primary-soft)] border-b-2 border-[var(--color-border-default)] py-[96px] relative z-20">
      <div className="w-full max-w-[1152px] mx-auto px-[24px]">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4 text-left items-start">
            <h2 className="text-[16px] font-bold text-[var(--color-section-brand)] uppercase tracking-widest border-2 border-[var(--color-border-default)] px-4 py-1 bg-[var(--color-neutral-primary-soft)] inline-block w-max">Tutorial</h2>
            <BlockReveal blockColor="var(--color-section-pink)">
              <h2 className="text-[48px] md:text-[64px] font-black text-[var(--color-heading)] leading-[0.95] tracking-tighter uppercase mb-4">How it works</h2>
            </BlockReveal>
            <p className="text-[20px] font-bold text-[var(--color-heading)] border-b-4 border-[var(--color-border-default)] pb-2 inline-block w-max">
              Three simple steps to unified payments. No complex integrations required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <BrutalistCard className="bg-[var(--color-section-pink)] flex flex-col hover:-translate-y-2 hover:-translate-x-2">
              <div className="p-8 flex flex-col gap-4 border-b-2 border-[var(--color-border-default)]">
                <div className="w-16 h-16 bg-[var(--color-neutral-primary-soft)] border-4 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] text-black flex items-center justify-center font-black text-[32px] transform -rotate-6">
                  1
                </div>
                <div>
                  <h3 className="text-[24px] font-black text-black uppercase tracking-wide mb-3">Generate Link</h3>
                  <p className="text-[16px] font-bold text-black leading-[1.4]">
                    Specify the exact amount of USDC you want to receive. We instantly generate a unique short payment link.
                  </p>
                </div>
              </div>
              {/* Mini Demo Segment */}
              <div className="bg-[var(--color-neutral-primary-soft)] p-6 flex flex-col gap-4 mt-auto rounded-b-[4px]">
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <span className="text-[16px] font-bold text-black uppercase">Amount</span>
                  <span className="text-[16px] font-black text-[var(--color-section-blue)]">USDC</span>
                </div>
                <div className="text-[48px] font-black text-black leading-none py-2">500.00</div>
                <BrutalistButton variant="brand" className="w-full mt-2">
                  Create Link <ArrowUpRight className="w-5 h-5 ml-1" strokeWidth={3} />
                </BrutalistButton>
              </div>
            </BrutalistCard>

            {/* Step 2 */}
            <BrutalistCard className="bg-[var(--color-section-yellow)] flex flex-col hover:-translate-y-2 hover:-translate-x-2">
              <div className="p-8 flex flex-col gap-4 border-b-2 border-[var(--color-border-default)]">
                <div className="w-16 h-16 bg-[var(--color-neutral-primary-soft)] border-4 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] text-black flex items-center justify-center font-black text-[32px] transform rotate-3">
                  2
                </div>
                <div>
                  <h3 className="text-[24px] font-black text-black uppercase tracking-wide mb-3">Share Anywhere</h3>
                  <p className="text-[16px] font-bold text-black leading-[1.4]">
                    Send the link to your client. The hosted checkout UI is clean, mobile-optimized, and instantly trustworthy.
                  </p>
                </div>
              </div>
              {/* Mini Demo Segment */}
              <div className="bg-[var(--color-neutral-primary-soft)] p-6 flex flex-col gap-4 mt-auto rounded-b-[4px]">
                <div className="flex items-center gap-3 bg-[var(--color-neutral-secondary-soft)] border-2 border-black p-3 shadow-[var(--shadow-xs)]">
                  <LinkIcon className="w-5 h-5 text-black" strokeWidth={3} />
                  <span className="text-[14px] font-bold text-black truncate flex-1">justpay.wtf/pay_8x...</span>
                  <Copy className="w-5 h-5 text-black ml-auto cursor-pointer" strokeWidth={3} />
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 h-3 border-2 border-black bg-[var(--color-neutral-secondary)]" />
                  <div className="flex-1 h-3 border-2 border-black bg-[var(--color-neutral-secondary)]" />
                </div>
              </div>
            </BrutalistCard>

            {/* Step 3 */}
            <BrutalistCard className="bg-[var(--color-section-cyan)] flex flex-col hover:-translate-y-2 hover:-translate-x-2">
              <div className="p-8 flex flex-col gap-4 border-b-2 border-[var(--color-border-default)]">
                <div className="w-16 h-16 bg-[var(--color-neutral-primary-soft)] border-4 border-[var(--color-border-default)] shadow-[var(--shadow-xs)] text-black flex items-center justify-center font-black text-[32px] transform -rotate-3">
                  3
                </div>
                <div>
                  <h3 className="text-[24px] font-black text-black uppercase tracking-wide mb-3">Instant Settlement</h3>
                  <p className="text-[16px] font-bold text-black leading-[1.4]">
                    Your client pays with whatever token they have. The funds settle instantly into your default wallet.
                  </p>
                </div>
              </div>
              {/* Mini Demo Segment */}
              <div className="bg-[var(--color-neutral-primary-soft)] p-6 flex flex-col gap-4 mt-auto rounded-b-[4px]">
                <div className="flex items-center gap-3 bg-[var(--color-success)] border-2 border-black p-3 shadow-[var(--shadow-xs)]">
                  <CheckCircle2 className="w-6 h-6 text-black" strokeWidth={3} />
                  <div className="flex flex-col">
                    <span className="text-[16px] font-black text-black uppercase leading-none">Complete</span>
                    <span className="text-[12px] font-bold text-black">Settled to wallet</span>
                  </div>
                </div>
                <div className="text-right mt-2">
                  <span className="text-[24px] font-black text-black">+$500.00 USDC</span>
                </div>
              </div>
            </BrutalistCard>

          </div>
        </div>
      </div>
    </div>
  );
}
