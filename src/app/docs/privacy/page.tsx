import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-32 pb-12 px-6 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-black/60 font-bold hover:text-black transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      <div className="bg-[var(--color-neutral-primary-soft)] border-4 border-black p-8 sm:p-12 shadow-[var(--shadow-md)]">
        <h1 className="text-4xl md:text-6xl font-black text-black uppercase mb-6">Privacy Policy</h1>
        <p className="text-lg font-bold text-black/60 mb-8 border-b-4 border-black pb-4 inline-block">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-black font-bold text-lg">
          <p>
            Your privacy is important to us. justpay.wtf is designed to collect as little personal information as possible.
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase mt-12 mb-4 bg-[var(--color-section-pink)] inline-block px-2 border-2 border-black">1. Data We Collect</h2>
          <p>
            We collect basic analytics to improve the platform and standard operational data required to route payments, such as public wallet addresses and transaction hashes. We do not require names, addresses, or KYC documentation.
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase mt-12 mb-4 bg-[var(--color-section-cyan)] inline-block px-2 border-2 border-black">2. Blockchain Transparency</h2>
          <p>
            Please note that all transactions conducted via justpay.wtf are broadcast to public blockchains (such as Ethereum, Base, and Solana). This data is public, permanent, and inherently visible to anyone.
          </p>
        </div>
      </div>
    </main>
  );
}
