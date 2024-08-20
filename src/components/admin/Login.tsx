"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useWallet } from './WalletContext';
import { useConnect } from "wagmi";

export default function Login() {
  const {
    connected,
    setConnected,
    userAddress,
    initializeWalletClient, 
  } = useWallet();
  const { connect, connectors, data: connectData } = useConnect();

  async function login(e: any) {
    e.preventDefault();
    try {
      // @ts-ignore
      await window.silk.login();
      // @ts-ignore
      // window.silk.loginSelector(window.silk)
      // .then((result: any) => {
      //   if (result === "silk") {
      //     // @ts-ignore
      //     window.ethereum = window.silk;
      //   } else if (result === 'injected') {
      //     connect({
      //     connector: connectors.filter((conn) => conn.id === 'injected')[0],
      //     })
      //   } else if (result === 'walletconnect') {
      //     connect({
      //     connector: connectors.filter((conn) => conn.id === 'walletConnect')[0],
      //     })
      //   }
      // })
      // .catch((err: any) => console.error(err));
      await initializeWalletClient();
    } catch (err: any) {
      console.error(err);
    }
  }

  async function logout(e: React.MouseEvent) {
    e.preventDefault();
    setConnected(false);
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
