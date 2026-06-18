'use client';

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { BlockReveal } from "@/components/animations/BlockReveal";

const stickyCardsData = [
  {
    index: "01",
    title: "Cross-Chain Routing",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80", // Blockchain nodes
    description: "Seamlessly route payments across Solana and EVM networks. We handle the complex bridging and swapping automatically so you receive exact USDC instantly.",
    color: "var(--color-section-cyan)",
  },
  {
    index: "02",
    title: "Zero Platform Fees",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80", // Bitcoin/Crypto
    description: "Keep 100% of your revenue. We don't take a cut from your transactions. Built for maximum efficiency and capital retention.",
    color: "var(--color-section-pink)",
  },
  {
    index: "03",
    title: "Instant Settlement",
    image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=800&q=80", // Solana
    description: "Get paid instantly directly to your wallet. No holding periods, no withdrawal delays. Your funds are yours the moment the transaction confirms.",
    color: "var(--color-section-yellow)",
  },
];

const FeatureCard = ({ card, index }: { card: any, index: number }) => {
  return (
    <div
      style={{
        backgroundColor: card.color,
      }}
      className="relative w-[80vw] md:w-[500px] shrink-0 text-black border-4 border-black shadow-[var(--shadow-xl)] flex flex-col hover:-translate-y-2 hover:shadow-[var(--shadow-2xl)] transition-all duration-300 whitespace-normal overflow-hidden"
    >
      <div className="flex-1 flex flex-col justify-between p-6 md:p-8 gap-4 md:gap-6 z-20">
        <h1 className="text-5xl md:text-[80px] font-black opacity-30 leading-none">{card.index}</h1>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight">{card.title}</h2>
          <div className="pt-4 border-t-4 border-black">
            <p className="text-sm md:text-lg font-bold text-black max-w-md leading-tight">
              {card.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export function StickyFeatures() {
  return (
    <main className="bg-[var(--color-neutral-primary-soft)] w-full relative z-10 overflow-hidden">
      
      <div className="py-24">
        <div className="max-w-[1200px] mx-auto px-[24px]">
          <div className="flex flex-col gap-4 text-left items-start mb-16">
            <h2 className="text-[16px] font-bold text-[var(--color-section-brand)] uppercase tracking-widest border-2 border-[var(--color-border-default)] px-4 py-1 bg-[var(--color-neutral-primary-soft)] inline-block w-max">Highlights</h2>
            <BlockReveal blockColor="var(--color-section-pink)">
              <h2 className="text-[48px] md:text-[64px] font-black text-black leading-[0.95] tracking-tighter uppercase mb-4">Features</h2>
            </BlockReveal>
            <p className="text-[20px] font-bold text-black border-b-4 border-black pb-2 inline-block w-max max-w-full">
              Discover what makes our platform unparalleled.
            </p>
          </div>
        </div>

        {/* Features Marquee */}
        <div className="w-full overflow-hidden bg-[var(--color-section-brand)] border-y-4 border-black py-8">
          <div className="marquee-content flex gap-8 whitespace-nowrap pl-8 items-stretch h-[320px]">
            {[...stickyCardsData, ...stickyCardsData, ...stickyCardsData].map((card, i) => (
              <FeatureCard
                key={i}
                index={i}
                card={card}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-content {
          animation: scroll 15s linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </main>
  );
}
