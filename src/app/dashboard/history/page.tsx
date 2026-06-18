'use client'

import { ArrowDownToLine, Search } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DashboardHistory() {
  const { address: evmAddress } = useAccount();
  const { publicKey } = useWallet();
  const address = evmAddress || publicKey?.toBase58();

  const rawTransactions = useQuery(api.transactions.getTransactionsByMerchant, address ? { merchantAddress: address } : "skip");
  const loading = rawTransactions === undefined;

  const transactions = (rawTransactions || []).map(tx => ({
    id: `${tx.sourceTxHash.slice(0, 8)}...${tx.sourceTxHash.slice(-6)}`,
    rawTxHash: tx.sourceTxHash,
    linkId: tx.linkId,
    amount: `${tx.sourceAmount} ${tx.sourceToken || 'NATIVE'}`,
    fromChain: tx.sourceChain,
    date: new Date(tx._creationTime).toLocaleString(),
    status: tx.status === 'confirmed' ? 'Settled' : tx.status === 'pending' ? 'Pending' : 'Failed'
  }));

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Transaction Hash', 'Link ID', 'Amount', 'Source Chain', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => `${tx.rawTxHash},${tx.linkId},${tx.amount},${tx.fromChain},"${tx.date}",${tx.status}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `justpay_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-foreground">Transaction History</h1>
        <p className="text-sm text-zinc-400">View and export all payments received through your generated links.</p>
      </div>

      <div className="glass-card flex flex-col overflow-hidden min-h-[400px]">
        {/* Filters & Search */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by TxID or Link ID..."
              className="input-field pl-10"
            />
          </div>

          <button onClick={handleExportCSV} disabled={transactions.length === 0} className="btn-secondary w-full sm:w-auto px-6 py-3 flex items-center gap-2 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ArrowDownToLine className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Transaction ID</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Link ID</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Source Chain</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">Loading history...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">No transactions found for this wallet.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.rawTxHash} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-mono text-foreground" title={tx.rawTxHash}>{tx.id}</td>
                    <td className="p-4 text-sm font-mono text-zinc-400">{tx.linkId}</td>
                    <td className="p-4 text-sm font-bold text-foreground">{tx.amount}</td>
                    <td className="p-4 text-sm text-zinc-400 capitalize">{tx.fromChain}</td>
                    <td className="p-4 text-sm text-zinc-500">{tx.date}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'Settled' ? 'bg-success/10 text-success border border-success/20' :
                          tx.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                            'bg-error/10 text-error border border-error/20'
                        }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
