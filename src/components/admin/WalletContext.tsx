import React, { createContext, useContext } from 'react';
import { WalletClient } from 'viem';

type WalletContextType = {
  connected: boolean | undefined;
  setConnected: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  walletClient: WalletClient | undefined;
  setWalletClient: React.Dispatch<React.SetStateAction<WalletClient | undefined>>;
  userAddress: string;
  setUserAddress: React.Dispatch<React.SetStateAction<string>>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;