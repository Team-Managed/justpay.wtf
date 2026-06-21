'use client';

import { useAccount, useAccountDisconnect, useWalletMenu } from '@lifi/wallet-management';
import { ChainType } from '@lifi/sdk';
import { Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrutalistButton } from '../brutalism/Button';

export function WalletConnectButton({ variant = 'navbar' }: { variant?: 'navbar' | 'form' | 'input' }) {
  const [mounted, setMounted] = useState(false);

  // LI.FI unified account — covers EVM + Solana + Sui (via WalletManagementProviders)
  const { account: evmAccount } = useAccount({ chainType: ChainType.EVM });
  const { account: svmAccount } = useAccount({ chainType: ChainType.SVM });
  const { account: suiAccount } = useAccount({ chainType: ChainType.MVM });
  const disconnect = useAccountDisconnect();

  // LI.FI's built-in wallet picker modal
  const { openWalletMenu } = useWalletMenu();

  useEffect(() => { setMounted(true); }, []);

  const evmAddress = evmAccount?.address;
  const svmAddress = svmAccount?.address;
  const suiAddress = suiAccount?.address;
  const connectedAddress = evmAddress || svmAddress || suiAddress;
  const connected = !!connectedAddress;

  const handleDisconnect = () => {
    if (evmAccount?.address) disconnect(evmAccount);
    if (svmAccount?.address) disconnect(svmAccount);
    if (suiAccount?.address) disconnect(suiAccount);
  };

  if (!mounted) {
    if (variant === 'input') {
      return (
        <button disabled className="bg-[var(--color-neutral-secondary-soft)] border-2 border-black p-2 opacity-50 cursor-not-allowed hidden md:block">
          <Wallet className="w-5 h-5 text-black" />
        </button>
      );
    }
    return (
      <BrutalistButton variant="tertiary" className="opacity-50 cursor-not-allowed">
        <Wallet className="w-5 h-5 mr-2" strokeWidth={3} />
        <span className="uppercase tracking-wider">Loading...</span>
      </BrutalistButton>
    );
  }

  if (connected) {
    const shortAddress = `${connectedAddress!.slice(0, 4)}...${connectedAddress!.slice(-4)}`;

    if (variant === 'input') {
      return (
        <button
          onClick={handleDisconnect}
          className="bg-[var(--color-section-pink)] border-2 border-black p-2 hover:bg-[var(--color-section-yellow)] transition-colors group hidden md:flex items-center t-tt-trigger"
        >
          <X className="w-5 h-5 text-black" strokeWidth={3} />
        </button>
      );
    }

    return (
      <BrutalistButton variant="brand" onClick={handleDisconnect} className="group min-w-[140px]">
        <Wallet className="w-5 h-5 mr-2 group-hover:hidden" strokeWidth={3} />
        <span className="uppercase tracking-wider font-black group-hover:hidden">{shortAddress}</span>
        <span className="uppercase tracking-wider font-black hidden group-hover:inline text-black">Disconnect</span>
      </BrutalistButton>
    );
  }

  // Not connected — open LI.FI's built-in wallet picker
  if (variant === 'input') {
    return (
      <button
        onClick={() => openWalletMenu()}
        className="bg-[var(--color-section-cyan)] border-2 border-black p-2 hover:bg-[var(--color-section-green)] transition-colors group hidden md:block t-tt-trigger"
      >
        <Wallet className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <BrutalistButton variant="tertiary" onClick={() => openWalletMenu()}>
      <Wallet className="w-5 h-5 mr-2" strokeWidth={3} />
      <span className="uppercase tracking-wider font-black">Connect Wallet</span>
    </BrutalistButton>
  );
}
