import Image from 'next/image';

export function BrutalistHero() {
  return (
    <section className="w-full bg-[var(--color-neutral-primary-soft)] border-b-2 border-[var(--color-border-default)]">
      {/* Top Bar */}
      <div className="w-full border-b-2 border-[var(--color-border-default)] py-4 px-6 flex justify-between items-center bg-[var(--color-neutral-primary-soft)]">
        <h2 className="text-[18px] font-bold text-[var(--color-heading)] m-0">Sui Overflow 2026</h2>
        <div className="text-[14px] font-bold text-[var(--color-section-cyan)]">
          <span className="text-[var(--color-section-blue)]">&lt;date&gt;</span> May - August, 2026 <span className="text-[var(--color-section-blue)]">&lt;/date&gt;</span>
        </div>
      </div>

      {/* Hero Content Area */}
      <div className="flex flex-col md:flex-row w-full relative overflow-hidden min-h-[500px]">
        {/* Left Side: Typography */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center z-10">
          <h1 className="text-[64px] md:text-[100px] font-bold leading-[0.9] text-[var(--color-heading)] tracking-tighter mb-4">
            Sui <br /> Overflow <br /> 2026
          </h1>
          <p className="text-[24px] font-bold text-[var(--color-heading)] mb-6">
            May - August, 2026
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-semibold text-[var(--color-body)]">Headline Partner:</span>
            <span className="text-[24px] font-black text-[var(--color-heading)] tracking-tighter">walrus</span>
          </div>
        </div>

        {/* Right Side: Graphic */}
        <div className="flex-1 relative min-h-[300px] md:min-h-full">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_9px,var(--color-section-blue)_10px),linear-gradient(90deg,transparent_9px,var(--color-section-blue)_10px)] bg-[length:40px_40px] opacity-20" />
          <Image 
            src="/images/hero_keyboard.png" 
            alt="Overflow Keyboard" 
            fill
            className="object-cover object-left md:object-center z-0"
          />
        </div>
      </div>

      {/* Bottom Navigation Tabs */}
      <div className="flex w-full overflow-x-auto border-t-2 border-[var(--color-border-default)]">
        <div className="flex-none flex items-center justify-center p-4 border-r-2 border-[var(--color-border-default)] bg-[var(--color-dark)] text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </div>
        <div className="flex-1 text-center py-4 px-6 border-r-2 border-[var(--color-border-default)] bg-[var(--color-section-blue)] font-bold cursor-pointer">
          Overview
        </div>
        <div className="flex-1 text-center py-4 px-6 border-r-2 border-[var(--color-border-default)] hover:bg-[var(--color-neutral-secondary)] font-bold cursor-pointer transition-colors">
          Why join us?
        </div>
        <div className="flex-1 text-center py-4 px-6 border-r-2 border-[var(--color-border-default)] hover:bg-[var(--color-neutral-secondary)] font-bold cursor-pointer transition-colors">
          Tracks
        </div>
        <div className="flex-1 text-center py-4 px-6 border-r-2 border-[var(--color-border-default)] hover:bg-[var(--color-neutral-secondary)] font-bold cursor-pointer transition-colors">
          Prizes
        </div>
        <div className="flex-1 text-center py-4 px-6 border-r-2 border-[var(--color-border-default)] hover:bg-[var(--color-neutral-secondary)] font-bold cursor-pointer transition-colors">
          Sponsors
        </div>
        <div className="flex-1 text-center py-4 px-6 border-r-2 border-[var(--color-border-default)] hover:bg-[var(--color-neutral-secondary)] font-bold cursor-pointer transition-colors">
          FAQ
        </div>
        <div className="flex-1 text-center py-4 px-6 border-r-2 border-[var(--color-border-default)] bg-[var(--color-dark)] text-white font-bold cursor-pointer hover:bg-[var(--color-body-subtle)] transition-colors">
          Register
        </div>
        <div className="flex-none flex items-center justify-center p-4 bg-[var(--color-section-blue)] cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
        </div>
      </div>
    </section>
  );
}
