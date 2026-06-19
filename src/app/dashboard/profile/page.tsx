'use client';

import { Save, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';

export default function DashboardProfile() {
  const { publicKey } = useWallet();
  const { address: evmAddress } = useAccount();

  const solAddressStr = publicKey ? publicKey.toBase58() : '';
  const evmAddressStr = evmAddress || '';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 border-b-4 border-black pb-4 mb-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black">Profile Settings</h1>
        <p className="text-lg font-bold text-black uppercase">Manage your connected wallets and API keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connected Wallet Settings */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-2">
            <div className="p-3 bg-[var(--color-section-yellow)] border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Wallet className="w-6 h-6" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-black uppercase tracking-wider">Default Settlement Wallet</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-black uppercase tracking-wider text-black bg-[var(--color-section-pink)] px-2 py-1 inline-block w-max border-2 border-black">Solana Address</label>
              <input
                type="text"
                value={solAddressStr}
                placeholder="Connect Solana wallet to view"
                className="w-full bg-white border-[3px] border-black px-4 py-3 text-[16px] font-mono font-bold text-black placeholder:text-black/50 focus:outline-none"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-black uppercase tracking-wider text-black bg-[var(--color-section-cyan)] px-2 py-1 inline-block w-max border-2 border-black">EVM Address (Ethereum, Arbitrum &amp; 40+ chains)</label>
              <input
                type="text"
                value={evmAddressStr}
                placeholder="Connect EVM wallet to view"
                className="w-full bg-white border-[3px] border-black px-4 py-3 text-[16px] font-mono font-bold text-black placeholder:text-black/50 focus:outline-none"
                readOnly
              />
            </div>

            <button className="w-full mt-4 px-6 py-4 flex items-center justify-center gap-2 border-[3px] border-black bg-[var(--color-section-green)] text-black font-black uppercase text-[18px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Save className="w-6 h-6" strokeWidth={3} /> Save Wallet Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
