'use client';

import { useAccount, useAccountDisconnect, useWalletMenu } from '@lifi/wallet-management';
import { ChainType } from '@lifi/sdk';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrutalistButton } from '../brutalism/Button';

// Sui still uses dapp-kit directly — @lifi/widget-provider-sui has a peer dep
// conflict with @mysten/dapp-kit-react vs @mysten/dapp-kit, so we keep Sui separate.

export function WalletConnectButton({ variant = 'navbar' }: { variant?: 'navbar' | 'form' | 'input' }) {
  const [mounted, setMounted] = useState(false);

  // LI.FI unified account — covers EVM + Solana (via WalletManagementProviders)
  const { account: evmAccount } = useAccount({ chainType: ChainType.EVM });
  const { account: svmAccount } = useAccount({ chainType: ChainType.SVM });
  const disconnect = useAccountDisconnect();

  // Sui — separate because of dependency conflict
  const suiAccount = useCurrentAccount();
  const { mutate: suiDisconnect } = useDisconnectWallet();

  // LI.FI's built-in wallet picker modal
  const { openWalletMenu } = useWalletMenu();

  useEffect(() => { setMounted(true); }, []);

  const evmAddress = evmAccount?.address;
  const svmAddress = svmAccount?.address;
  const suiAddress = suiAccount?.address;
  const connectedAddress = evmAddress || svmAddress || suiAddress;
  const connected = !!connectedAddress;

  const handleDisconnect = () => {
    if (evmAccount) disconnect(evmAccount);
    if (svmAccount) disconnect(svmAccount);
    if (suiAccount) suiDisconnect();
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


export function WalletConnectButton({ variant = 'navbar' }: { variant?: 'navbar' | 'form' | 'input' }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuiModalOpen, setIsSuiModalOpen] = useState(false);

  const { publicKey, connected: solConnected, disconnect: solDisconnect } = useWallet();
  const { setVisible: setSolanaModalVisible } = useWalletModal();

  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { connect: evmConnect } = useConnect();
  const { disconnect: evmDisconnect } = useDisconnect();

  const suiAccount = useCurrentAccount();
  const { mutate: suiDisconnect } = useDisconnectWallet();
  const suiConnected = !!suiAccount;

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const connected = solConnected || evmConnected || suiConnected;

  if (!mounted) {
    if (variant === 'input') {
      return (
        <button disabled className="bg-[var(--color-neutral-secondary-soft)] border-2 border-black p-2 opacity-50 cursor-not-allowed hidden md:block">
          <Wallet className="w-5 h-5 text-black" />
        </button>
      )
    }
    return (
      <BrutalistButton variant="tertiary" className="opacity-50 cursor-not-allowed">
        <Wallet className="w-5 h-5 mr-2" strokeWidth={3} />
        <span className="uppercase tracking-wider">Loading...</span>
      </BrutalistButton>
    );
  }

  if (connected) {
    const address = solConnected ? publicKey?.toBase58() : evmConnected ? evmAddress : suiAccount?.address;
    const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

    if (variant === 'input') {
      return (
        <button
          onClick={() => {
            if (solConnected) solDisconnect();
            if (evmConnected) evmDisconnect();
            if (suiConnected) suiDisconnect();
          }}
          className="bg-[var(--color-section-pink)] border-2 border-black p-2 hover:bg-[var(--color-section-yellow)] transition-colors group hidden md:flex items-center t-tt-trigger"
        >
          <X className="w-5 h-5 text-black" strokeWidth={3} />
        </button>
      )
    }

    return (
      <BrutalistButton
        variant="brand"
        onClick={() => {
          if (solConnected) solDisconnect();
          if (evmConnected) evmDisconnect();
          if (suiConnected) suiDisconnect();
        }}
        className="group min-w-[140px]"
      >
        <Wallet className="w-5 h-5 mr-2 group-hover:hidden" strokeWidth={3} />
        <span className="uppercase tracking-wider font-black group-hover:hidden">{shortAddress}</span>
        <span className="uppercase tracking-wider font-black hidden group-hover:inline text-black">Disconnect</span>
      </BrutalistButton>
    );
  }

  return (
    <>
      {variant === 'input' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[var(--color-section-cyan)] border-2 border-black p-2 hover:bg-[var(--color-section-green)] transition-colors group hidden md:block t-tt-trigger"
        >
          <Wallet className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
        </button>
      ) : (
        <BrutalistButton
          variant="tertiary"
          onClick={() => setIsOpen(true)}
        >
          <Wallet className="w-5 h-5 mr-2" strokeWidth={3} />
          <span className="uppercase tracking-wider font-black">Connect Wallet</span>
        </BrutalistButton>
      )}

      <ConnectModal
        trigger={<span className="hidden" />}
        open={isSuiModalOpen}
        onOpenChange={setIsSuiModalOpen}
      />

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-neutral-primary-soft)] border-4 border-black w-full max-w-sm relative animate-in fade-in zoom-in duration-200 shadow-[var(--shadow-xl)] transform rotate-1">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-4 -right-4 bg-[var(--color-section-pink)] border-4 border-black p-2 text-black hover:bg-[var(--color-section-yellow)] shadow-[var(--shadow-xs)] transition-colors z-10"
            >
              <X className="w-6 h-6" strokeWidth={3} />
            </button>
            <div className="p-8 flex flex-col gap-6">
              <h2 className="text-[28px] font-black text-black text-center mb-2 uppercase border-b-4 border-black pb-2">Connect Wallet</h2>

              <button
                onClick={() => {
                  setIsOpen(false);
                  evmConnect({ connector: injected() });
                }}
                className="flex items-center justify-between p-4 bg-blue-100 border-4 border-black hover:bg-blue-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[var(--shadow-sm)] transition-all group w-full"
              >
                <div className="flex items-center gap-3">
                  <img src="https://img.logo.dev/ethereum.org?token=pk_BShsdiwDTuyRVVBW5GadOg&bg=transparent" alt="EVM" className="w-8 h-8 object-contain bg-transparent" />
                  <span className="font-black text-[18px] text-black uppercase tracking-wider">EVM Wallets</span>
                </div>
                <ChevronRight className="w-6 h-6 text-black group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setSolanaModalVisible(true);
                }}
                className="flex items-center justify-between p-4 bg-purple-100 border-4 border-black hover:bg-purple-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[var(--shadow-sm)] transition-all group w-full"
              >
                <div className="flex items-center gap-3">
                  <img src="https://img.logo.dev/solana.com?token=pk_BShsdiwDTuyRVVBW5GadOg&bg=transparent" alt="Solana" className="w-8 h-8 object-contain bg-transparent" />
                  <span className="font-black text-[18px] text-black uppercase tracking-wider">Solana</span>
                </div>
                <ChevronRight className="w-6 h-6 text-black group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSuiModalOpen(true);
                }}
                className="flex items-center justify-between p-4 bg-[var(--color-section-cyan)] border-4 border-black hover:bg-[var(--color-section-cyan)]/80 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[var(--shadow-sm)] transition-all group w-full"
              >
                <div className="flex items-center gap-3">
                  <img src="https://img.logo.dev/sui.io?token=pk_BShsdiwDTuyRVVBW5GadOg&bg=transparent" alt="Sui" className="w-8 h-8 object-contain bg-transparent" />
                  <span className="font-black text-[18px] text-black uppercase tracking-wider">Sui</span>
                </div>
                <ChevronRight className="w-6 h-6 text-black group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
