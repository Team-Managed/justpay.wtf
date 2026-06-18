'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { Copy, ExternalLink, PowerOff } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function LinksManagement() {
  const { publicKey } = useWallet();
  const { address: evmAddress } = useAccount();
  const address = publicKey?.toBase58() || evmAddress;

  const links = useQuery(api.links.getLinksByMerchant, address ? { merchantAddress: address } : "skip");
  const isLoading = links === undefined;

  const handleCopy = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleDeactivate = async (id: string) => {
    // TODO: Add Convex mutation for link deactivation
    alert('Deactivation will be available soon.');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-foreground">Payment Links</h1>
      </div>

      <div className="glass-card p-6">
        {isLoading ? (
          <p className="text-zinc-400">Loading links...</p>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/[0.15] rounded-2xl">
            <p className="text-zinc-400 text-sm">No payment links created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Label</th>
                  <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Amount</th>
                  <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(links || []).map((link) => (
                  <tr key={link._id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-medium text-white">{link.label || 'Payment'}</td>
                    <td className="py-4 px-4 font-mono text-zinc-300">${link.amount} {link.destinationTokenSymbol}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        link.status === 'active' ? 'bg-success/10 text-success' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 flex items-center gap-3">
                      <button onClick={() => handleCopy(link.shortCode)} className="text-zinc-400 hover:text-white" title="Copy Link">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a href={`/${link.shortCode}`} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white" title="Open Link">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {link.status === 'active' && (
                        <button onClick={() => handleDeactivate(link._id)} className="text-error hover:text-error/80" title="Deactivate">
                          <PowerOff className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
