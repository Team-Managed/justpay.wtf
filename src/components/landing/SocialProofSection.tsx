export function SocialProofSection() {
  return (
    <section className="py-12 border-y border-border bg-[#050505]/50 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">100%</span>
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Non-Custodial</span>
        </div>
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">$0.00</span>
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Platform Fees</span>
        </div>
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">4+</span>
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Supported Chains</span>
        </div>
        <div className="flex flex-col gap-1 text-center md:text-left hidden lg:flex">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">&lt; 3s</span>
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Avg Settlement</span>
        </div>
      </div>
    </section>
  )
}
