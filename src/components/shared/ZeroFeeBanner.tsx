import { Zap } from 'lucide-react';
import { getPolicy } from '@/lib/config/chain-policy';

interface ZeroFeeBannerProps {
  chain: string;
}

export function ZeroFeeBanner({ chain }: ZeroFeeBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-success/10 border border-success/20 text-sm font-medium">
      <div className="flex items-center gap-2 text-success">
        <Zap className="w-4 h-4" />
        <span>Platform Fee: $0.00</span>
      </div>
      <span className="text-zinc-400 opacity-80 text-xs mt-1">Network Fee: Payer's Responsibility</span>
    </div>
  );
}
