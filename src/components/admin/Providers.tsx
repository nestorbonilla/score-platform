"use client";
import { useCallback, useEffect, useState } from "react";
import { initSilk } from "@silk-wallet/silk-wallet-sdk";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from "@/lib/config";
import WalletContext from "./WalletContext";
import { WalletClient, createWalletClient, custom } from "viem";
import { arbitrum, baseSepolia } from "viem/chains";
import { ethers, JsonRpcSigner } from "ethers";

const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  const [connected, setConnected] = useState<boolean | undefined>(undefined);
  const [walletClient, setWalletClient] = useState<WalletClient | undefined>(undefined);
  const [userAddress, setUserAddress] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("baseSepolia");
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
  const [initializing, setInitializing] = useState(false);

  const viemChainToEthersNetwork = (chain: any) => ({
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  });

  const initializeWalletClient = useCallback(async () => {
    if (initializing || walletClient) return;
    setInitializing(true);

    try {
      const network = currentNetwork === "arbitrum" ? arbitrum : baseSepolia;
      const newWalletClient = createWalletClient({
        chain: network,
        // @ts-ignore
        transport: custom(window.silk as any),
      });

      setWalletClient(newWalletClient);

      const ethersNetwork = viemChainToEthersNetwork(network);
      const provider = new ethers.BrowserProvider(newWalletClient.transport, ethersNetwork);

      const newSigner = await provider.getSigner(newWalletClient.account);
      console.log("Got signer:", newSigner);
      setSigner(newSigner);
      setConnected(true);
    } catch (error) {
      console.error("Error initializing wallet client:", error);
    } finally {
      setInitializing(false);
    }
  }, [currentNetwork, initializing, walletClient]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const silk = initSilk();
    // @ts-ignore
    window.silk = silk;

    const checkConnection = async () => {
      try {
        // @ts-ignore
        const accounts = await window.silk.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          initializeWalletClient();
        } else {
          setConnected(false);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setConnected(false);
      }
    };

    checkConnection();
  }, [initializeWalletClient]);

  return (
    <WalletContext.Provider value={{ connected, setConnected, walletClient, setWalletClient, userAddress, setUserAddress, currentNetwork, setCurrentNetwork, initializeWalletClient, signer, setSigner }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </WalletContext.Provider>
  );
}
