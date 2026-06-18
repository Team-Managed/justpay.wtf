'use client';

import { useRef } from 'react';
import { ArrowUpRight, Activity } from 'lucide-react';
import { BrutalistCard } from '../brutalism/Card';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { BlockReveal } from '@/components/animations/BlockReveal';

export function DemoSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Floating animation for the stat cards
    gsap.to('.demo-card', {
      y: -5,
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.2
    });

    // Pulse animation for the system status
    gsap.to('.system-status', {
      opacity: 0.7,
      duration: 1,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    // Slide in animation for transactions on hover
    gsap.utils.toArray('.demo-tx').forEach((tx: any) => {
      tx.addEventListener('mouseenter', () => {
        gsap.to(tx, { x: 10, duration: 0.2, ease: "power2.out" });
      });
      tx.addEventListener('mouseleave', () => {
        gsap.to(tx, { x: 0, duration: 0.2, ease: "power2.out" });
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full max-w-[1152px] mx-auto px-[24px] py-[96px] relative z-20">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h2 className="text-[16px] font-bold text-[var(--color-section-brand)] uppercase tracking-widest border-2 border-[var(--color-border-default)] px-4 py-1 bg-[var(--color-neutral-primary-soft)] inline-block w-max">Live Preview</h2>
          <BlockReveal blockColor="var(--color-section-pink)">
            <h2 className="text-[48px] md:text-[64px] font-black text-[var(--color-heading)] leading-[0.95] tracking-tighter uppercase mb-4">
              Monitor Everything In Real-Time
            </h2>
          </BlockReveal>
          <p className="text-[20px] font-bold text-[var(--color-heading)] border-b-4 border-[var(--color-border-default)] pb-2 inline-block">A fully functional interface, built for speed.</p>
        </div>
        
        <div className="flex items-center justify-between mb-2 border-b-4 border-[var(--color-border-default)] pb-2">
          <h2 className="text-[20px] font-black text-[var(--color-heading)] uppercase tracking-widest">Dashboard Demo</h2>
          <div className="px-3 py-1 bg-[var(--color-section-yellow)] border-2 border-[var(--color-border-default)] text-[14px] font-bold text-black animate-pulse shadow-[var(--shadow-xs)]">
            Demo Mode
          </div>
        </div>
        
        {/* Brutalist Dashboard UI Mockup */}
        <div className="bg-[var(--color-neutral-secondary-soft)] border-4 border-[var(--color-border-default)] p-4 shadow-[var(--shadow-xl)] relative overflow-hidden">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <BrutalistCard className="demo-card p-6 bg-[var(--color-section-cyan)] hover:-translate-y-0">
              <p className="text-black font-bold text-[16px] mb-2 uppercase border-b-2 border-black pb-2">Total Volume</p>
              <div className="flex items-baseline gap-2 mt-4">
                <h2 className="text-[36px] font-bold text-black leading-none">$12,450.00</h2>
                <span className="text-black text-[14px] font-bold flex items-center bg-[var(--color-success)] border-2 border-black px-2 py-0.5 shadow-[var(--shadow-xs)]">
                  +14% <ArrowUpRight className="w-4 h-4 ml-1" strokeWidth={3} />
                </span>
              </div>
            </BrutalistCard>

            <BrutalistCard className="p-6 bg-[var(--color-section-pink)] hover:-translate-y-0">
              <p className="text-black font-bold text-[16px] mb-2 uppercase border-b-2 border-black pb-2">Active Links</p>
              <h2 className="text-[48px] font-bold text-black leading-none mt-2">8</h2>
            </BrutalistCard>

            <BrutalistCard className="p-6 bg-[var(--color-section-green)] sm:col-span-2 lg:col-span-1 hover:-translate-y-0">
              <p className="text-black font-bold text-[16px] mb-2 flex items-center gap-2 uppercase border-b-2 border-black pb-2">
                <Activity className="w-5 h-5" strokeWidth={3} /> System Status
              </p>
              <h2 className="text-[36px] font-bold text-black leading-none mt-4">OPERATIONAL</h2>
            </BrutalistCard>
          </div>

          <div className="bg-[var(--color-neutral-primary-soft)] border-2 border-[var(--color-border-default)] p-6 shadow-[var(--shadow-sm)]">
            <h4 className="text-[20px] font-black text-[var(--color-heading)] mb-6 uppercase border-b-2 border-[var(--color-border-default)] pb-2">Recent Transactions</h4>
            <div className="flex flex-col gap-4">
              
              <div className="flex items-center justify-between p-4 bg-[var(--color-neutral-secondary-soft)] border-2 border-[var(--color-border-default)] hover:bg-[var(--color-section-yellow)] transition-colors group">
                <div className="flex flex-col gap-1">
                  <p className="text-[18px] font-bold text-[var(--color-heading)] uppercase">Payment Received</p>
                  <p className="text-[14px] font-bold text-[var(--color-body-subtle)]">2 hours ago</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[24px] font-black text-[var(--color-success)]">+$500.00</p>
                  <span className="px-3 py-1 text-[14px] font-bold bg-[var(--color-success)] text-black border-2 border-black shadow-[var(--shadow-xs)]">SETTLED</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[var(--color-neutral-secondary-soft)] border-2 border-[var(--color-border-default)] hover:bg-[var(--color-section-yellow)] transition-colors group">
                <div className="flex flex-col gap-1">
                  <p className="text-[18px] font-bold text-[var(--color-heading)] uppercase">Payment Received</p>
                  <p className="text-[14px] font-bold text-[var(--color-body-subtle)]">5 hours ago</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[24px] font-black text-[var(--color-success)]">+$1,200.00</p>
                  <span className="px-3 py-1 text-[14px] font-bold bg-[var(--color-success)] text-black border-2 border-black shadow-[var(--shadow-xs)]">SETTLED</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
