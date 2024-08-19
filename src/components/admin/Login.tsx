"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  createWalletClient,
  custom
} from "viem";
import { baseSepolia } from "viem/chains";
import { useWallet } from './WalletContext';

export default function Login() {
  const {
    connected,
    setConnected,
    walletClient,
    setWalletClient,
    userAddress,
    setUserAddress,
  } = useWallet();
  
  async function login(e: any) {
    e.preventDefault();
    try {
      // @ts-ignore
      await window.silk.login();
      // await window.silk.loginSelector('injected');
      const newWalletClient = createWalletClient({
        chain: baseSepolia,
        // @ts-ignore
        transport: custom(window.silk as any),
      });
      setWalletClient(newWalletClient);
      setConnected(true);
      const [address] = await newWalletClient.requestAddresses();
      setUserAddress(address);
    } catch (err: any) {
      console.error(err);
    }
  }
  
  async function logout(e: React.MouseEvent) {
    e.preventDefault();
    setConnected(false);
    setWalletClient(undefined);
    setUserAddress("");
  }

  return (
    <div>
      {!connected && !walletClient && userAddress.length === 0 ? (
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