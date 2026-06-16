'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';
import { Copy, ExternalLink, PowerOff } from 'lucide-react';

export default function LinksManagement() {
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { publicKey } = useWallet();
  const { address: evmAddress } = useAccount();
  const address = publicKey?.toBase58() || evmAddress;

  useEffect(() => {
    async function fetchLinks() {
      if (!address) {
        setLinks([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('payment_links')
          .select('*')
          .eq('creator_address', address)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLinks(data || []);
      } catch (err) {
        console.error("Failed to fetch links:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLinks();
  }, [address]);

  const handleCopy = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleDeactivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_links')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) throw error;
      
      setLinks(prev => prev.map(l => l.id === id ? { ...l, status: 'cancelled' } : l));
    } catch (err) {
      console.error(err);
      alert('Failed to deactivate link.');
    }
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
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-medium text-white">{link.label || 'Payment'}</td>
                    <td className="py-4 px-4 font-mono text-zinc-300">${link.amount} {link.token_symbol}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        link.status === 'active' ? 'bg-success/10 text-success' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 flex items-center gap-3">
                      <button onClick={() => handleCopy(link.short_code)} className="text-zinc-400 hover:text-white" title="Copy Link">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a href={`/${link.short_code}`} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white" title="Open Link">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {link.status === 'active' && (
                        <button onClick={() => handleDeactivate(link.id)} className="text-error hover:text-error/80" title="Deactivate">
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
