import { Zap } from 'lucide-react';
import { getPolicy } from '@/lib/config/chain-policy';

interface FeeDisclosureBannerProps {
  chain: string;
}

export function FeeDisclosureBanner({ chain }: FeeDisclosureBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-success/10 border border-success/20 text-sm font-medium">
      <div className="flex flex-col items-center gap-1 text-success">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>Platform Fee: 0%</span>
        </div>
        <span className="text-zinc-400 opacity-80 text-xs">Bridge Provider (LI.FI) Fee: ~0.25% + Network Gas</span>
      </div>
    </div>
  );
}
