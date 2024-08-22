"use client";
import { useCallback, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from "@/lib/config";
import WalletContext from "./WalletContext";
import { Magic, MagicUserMetadata } from 'magic-sdk';
import { SafeAccountV0_2_0 as SafeAccount } from "abstractionkit";

const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  const [magicMetadata, setMagicMetadata] = useState<MagicUserMetadata>();
  const [smartAccount, setSmartAccount] = useState<SafeAccount>();
  const [magic, setMagic] = useState<Magic | undefined>(undefined);

  useEffect(() => {
    setMagic(new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!));
  }, []);

  const fetchAccounts = useCallback(async () => {
    if (magic) {
      try {
        const metadata = await magic.user.getInfo();
        setMagicMetadata(metadata);

        if (metadata && metadata.publicAddress) {
          setSmartAccount(SafeAccount.initializeNewAccount([metadata.publicAddress]));
        }
      } catch (error) {
        console.error("Error fetching user metadata:", error);
      }
    }
  }, [magic]); 

  useEffect(() => {
    fetchAccounts();
  }, [magic, fetchAccounts]); 

  return (
    <WalletContext.Provider value={{
      magic,
      magicMetadata, 
      smartAccount, 
      fetchAccounts
    }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </WalletContext.Provider>
  );
}