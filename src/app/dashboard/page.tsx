'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Activity, X } from 'lucide-react';
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { supabase } from "@/lib/supabase";
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'wagmi';

interface ActivityItem {
  id: string;
  action: string;
  amount: string;
  time: string;
  status: string;
  timestamp: Date;
}

export default function DashboardOverview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalVolume, setTotalVolume] = useState(0);
  const [activeLinks, setActiveLinks] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { publicKey } = useWallet();
  const { address: evmAddress } = useAccount();
  const address = publicKey?.toBase58() || evmAddress;

  useEffect(() => {
    async function fetchData() {
      if (!address) {
        setIsLoading(false);
        setTotalVolume(0);
        setActiveLinks(0);
        setActivities([]);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch active links
        const { data: links, error: linksError } = await supabase
          .from('payment_links')
          .select('id, amount, status, created_at')
          .eq('creator_address', address);

        if (linksError) throw linksError;

        const activeLinksCount = links?.filter(l => l.status === 'active').length || 0;
        setActiveLinks(activeLinksCount);

        const linkIds = links?.map(l => l.id) || [];

        // Map link creation to activity feed
        let feed: ActivityItem[] = (links || []).map(l => ({
          id: `link-${l.id}`,
          action: 'Link Generated',
          amount: `$${Number(l.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}`,
          time: new Date(l.created_at).toLocaleDateString(),
          status: l.status === 'active' ? 'Active' : 'Completed',
          timestamp: new Date(l.created_at)
        }));

        // Fetch transactions for those links
        if (linkIds.length > 0) {
          const { data: txs, error: txsError } = await supabase
            .from('transactions')
            .select('id, amount_paid, status, created_at, token_paid')
            .in('link_id', linkIds);

          if (txsError) throw txsError;

          const volume = txs?.reduce((sum, tx) => sum + Number(tx.amount_paid), 0) || 0;
          setTotalVolume(volume);

          // Add transactions to activity feed
          const txFeed: ActivityItem[] = (txs || []).map(tx => ({
            id: `tx-${tx.id}`,
            action: 'Payment Received',
            amount: `+${Number(tx.amount_paid).toLocaleString(undefined, {minimumFractionDigits: 2})} ${tx.token_paid}`,
            time: new Date(tx.created_at).toLocaleDateString(),
            status: tx.status === 'confirmed' ? 'Settled' : 'Pending',
            timestamp: new Date(tx.created_at)
          }));

          feed = [...feed, ...txFeed];
        }

        feed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(feed);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [address]);

  return (
    <div className="flex flex-col gap-12">
      {/* Overview Section */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Overview</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-auto px-6 py-2 shadow-none text-sm"
          >
            Generate New Link
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <p className="text-gray-400 font-medium text-sm mb-2">Total Volume</p>
            <div className="flex items-baseline gap-3">
              {isLoading ? (
                <div className="h-9 w-32 bg-white/5 animate-pulse rounded-lg"></div>
              ) : (
                <h2 className="text-3xl font-bold text-white">${totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-gray-400 font-medium text-sm mb-2">Active Links</p>
            {isLoading ? (
               <div className="h-9 w-16 bg-white/5 animate-pulse rounded-lg"></div>
            ) : (
               <h2 className="text-3xl font-bold text-white">{activeLinks}</h2>
            )}
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <p className="text-primary font-medium text-sm mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> System Status
            </p>
            <h2 className="text-xl font-bold text-white mt-1">All Systems Operational</h2>
            <p className="text-xs text-gray-400 mt-2">Routing engine is online.</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          
          {isLoading ? (
             <div className="flex flex-col gap-4">
               {[1,2,3].map(i => (
                 <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-2xl"></div>
               ))}
             </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-400 text-sm">No payment activity found for this wallet yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activities.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-white">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`text-sm font-bold ${item.amount.startsWith('+') ? 'text-success' : 'text-white'}`}>
                      {item.amount}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Settled' || item.status === 'Active' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 sm:p-8 relative z-0">
              <div className="flex flex-col gap-2 mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Create Payment Link</h2>
                <p className="text-sm text-gray-400 font-medium">Step 1: Connect your destination wallet</p>
              </div>
              <CreateLinkForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
