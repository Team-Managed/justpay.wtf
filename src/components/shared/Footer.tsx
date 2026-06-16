import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-surface/50 backdrop-blur-md py-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500 font-medium">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p>© {new Date().getFullYear()} justpay.wtf. All rights reserved.</p>
          <p className="text-xs text-zinc-600">A zero-custody, zero-contract execution layer.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/docs/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/docs/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/docs/risk" className="hover:text-primary transition-colors">
            Risk Disclosure
          </Link>
        </div>
      </div>
    </footer>
  );
}
