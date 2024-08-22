"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "./WalletContext";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function Login() {
  const { magic, magicMetadata, smartAccount, fetchAccounts } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  async function login(e: any) {
    e.preventDefault();
    setIsOpen(true);
  }

  async function logout(e: React.MouseEvent) {
    e.preventDefault();
    const isLoggedOut = await magic!.user.logout();
    if (isLoggedOut) {
      // setMagicMetadata(undefined);
      // setSmartAccount(undefined);
    }
  }

  const handleEmailSubmit = async () => {
    console.log("Entered email:", email);
    const didToken = await magic!.auth.loginWithMagicLink({ email});
    didToken && fetchAccounts();
    setIsOpen(false);
  }

  return (
    <div>
      {!magicMetadata && !smartAccount ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={login}>
              Login
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
            </DialogHeader>
            <Input 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Button onClick={handleEmailSubmit}>Submit</Button>
          </DialogContent>
        </Dialog>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUserIcon className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{magicMetadata?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{magicMetadata?.publicAddress}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{smartAccount?.accountAddress}</DropdownMenuLabel>
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