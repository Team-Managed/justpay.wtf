import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RiskPage() {
  return (
    <main className="min-h-screen pt-32 pb-12 px-6 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-black/60 font-bold hover:text-black transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      <div className="bg-[var(--color-neutral-primary-soft)] border-4 border-black p-8 sm:p-12 shadow-[var(--shadow-md)]">
        <h1 className="text-4xl md:text-6xl font-black text-black uppercase mb-6">Risk Disclosure</h1>
        <p className="text-lg font-bold text-black/60 mb-8 border-b-4 border-black pb-4 inline-block">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-black font-bold text-lg">
          <p>
            Engaging in cryptographic transactions involves significant risk. Please read carefully.
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase mt-12 mb-4 bg-[var(--color-section-pink)] inline-block px-2 border-2 border-black">1. Asset Volatility</h2>
          <p>
            The value of digital assets can fluctuate wildly. justpay.wtf is not responsible for any financial losses resulting from slippage, price changes during the cross-chain swap process, or general market volatility.
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase mt-12 mb-4 bg-[var(--color-section-cyan)] inline-block px-2 border-2 border-black">2. Finality of Transactions</h2>
          <p>
            Cryptocurrency transactions are irreversible. If you send funds to the wrong address, or if you fall victim to a phishing attack or spoofed link, justpay.wtf cannot reverse the transaction or recover your funds. Always verify the destination address and network before confirming a transaction in your wallet.
          </p>
        </div>
      </div>
    </main>
  );
}
