"use client";

import { useEffect, useState } from "react";
import { initSilk } from "@silk-wallet/silk-wallet-sdk";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from "@/lib/config";
import WalletContext from "./WalletContext";
import { WalletClient, createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";

const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  const [connected, setConnected] = useState<boolean | undefined>(undefined);
  const [walletClient, setWalletClient] = useState<WalletClient | undefined>(undefined);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const silk = initSilk();
    // @ts-ignore
    window.ethereum = silk;
  
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // @ts-ignore
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setConnected(true);
        initializeWalletClient();
      } else {
        setConnected(false);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
      setConnected(false);
    }
  };

  const initializeWalletClient = () => {
    const newWalletClient = createWalletClient({
      chain: mainnet,
      // @ts-ignore
      transport: custom(window.ethereum as any),
    });
    setWalletClient(newWalletClient);
  };
  
  return (
    <WalletContext.Provider value={{ connected, setConnected, walletClient, setWalletClient }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </WalletContext.Provider>
  );
}