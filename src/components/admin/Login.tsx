"use client";

import { useEffect, useState } from "react";
import { initSilk } from "@silk-wallet/silk-wallet-sdk";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  createWalletClient,
  custom,
  WalletClient,
} from "viem";
import { mainnet } from "viem/chains";

export default function LoginSection() {
  
  const [userAddress, setUserAddress] = useState("");
  const [walletClient, setWalletClient] = useState<WalletClient | undefined>();
  const [connected, setConnected] = useState<boolean | undefined>(undefined);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const silk = initSilk();
    // @ts-ignore
    window.ethereum = silk;
  
    (async () => {
      try {
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setConnected(true);
        }
      } catch (err: any) {
        console.error(err);
      }
    })();
  }, []);
  
  
  async function login(e: any) {
    e.preventDefault();
    try {
      // @ts-ignore
      await window.ethereum.login();
      const newWalletClient = createWalletClient({
        chain: mainnet,
        // @ts-ignore
        transport: custom(window.ethereum as any),
      });
      setWalletClient(newWalletClient);
      setConnected(true);
      // Request addresses after successful login
      const [address] = await newWalletClient.requestAddresses();
      setUserAddress(address);
    } catch (err: any) {
      console.error(err);
    }
  }
  
  async function logout(e: any) {
    e.preventDefault();
    // @ts-ignore
    window.ethereum = null;
    setConnected(false);
    setUserAddress("");
  }

  return (
    <div>
      {!connected ? (
        <Button onClick={login}>
          Login 
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUserIcon className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userAddress}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>    
  );
}

function CircleUserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}