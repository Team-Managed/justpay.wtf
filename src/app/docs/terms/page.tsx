import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-32 pb-12 px-6 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-black/60 font-bold hover:text-black transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      <div className="bg-[var(--color-neutral-primary-soft)] border-4 border-black p-8 sm:p-12 shadow-[var(--shadow-md)]">
        <h1 className="text-4xl md:text-6xl font-black text-black uppercase mb-6">Terms of Service</h1>
        <p className="text-lg font-bold text-black/60 mb-8 border-b-4 border-black pb-4 inline-block">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-black font-bold text-lg">
          <p>
            Welcome to justpay.wtf. By using our service, you agree to these Terms of Service.
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase mt-12 mb-4 bg-[var(--color-section-pink)] inline-block px-2 border-2 border-black">1. Non-Custodial Nature</h2>
          <p>
            justpay.wtf is a strictly non-custodial software service. We do not hold, transmit, or custody any user funds. All transactions are executed directly between the payer and the recipient on decentralized networks via smart contracts.
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase mt-12 mb-4 bg-[var(--color-section-cyan)] inline-block px-2 border-2 border-black">2. Assumption of Risk</h2>
          <p>
            Users assume all risks associated with cryptographic transactions, including but not limited to network congestion, slippage, wallet compromise, and smart contract vulnerabilities.
          </p>
        </div>
      </div>
    </main>
  );
}
