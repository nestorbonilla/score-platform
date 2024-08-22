import { createContext, useContext } from "react";
import { Magic, MagicUserMetadata } from "magic-sdk";
import { SafeAccountV0_2_0 as SafeAccount } from "abstractionkit";

type WalletContextType = {
  magic: Magic | undefined;
  magicMetadata: MagicUserMetadata | undefined;
  smartAccount: SafeAccount | undefined;
  fetchAccounts: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WagmiProvider");
  }
  return context;
};

export default WalletContext;