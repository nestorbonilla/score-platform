"use client";
import { useCallback, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from "@/lib/config";
import WalletContext from "./WalletContext";
import { Magic, MagicUserMetadata } from 'magic-sdk';
import { SafeAccountV0_2_0 as SafeAccount } from "abstractionkit";
import { arbitrum, sepolia } from "viem/chains";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { ApolloLink } from '@apollo/client';

const queryClient = new QueryClient();

const httpLink = new HttpLink({ uri: 'https://sepolia.easscan.org/graphql' });

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const loggerLink = new ApolloLink((operation, forward) => {
  console.log(`GraphQL Request: ${operation.operationName}`, operation.variables);
  return forward(operation).map((result) => {
    // console.log(`GraphQL Result: ${operation.operationName}`, result);
    return result;
  });
});

const easClient = new ApolloClient({
  link: ApolloLink.from([errorLink, loggerLink, httpLink]),
  cache: new InMemoryCache(),
});

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  const [magicMetadata, setMagicMetadata] = useState<MagicUserMetadata>();
  const [smartAccount, setSmartAccount] = useState<SafeAccount>();
  const [magic, setMagic] = useState<Magic | undefined>(undefined);

  useEffect(() => {
    setMagic(new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!, {network: {rpcUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT!, chainId: sepolia.id}, deferPreload: true, useStorageCache: true}));
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
      <ApolloProvider client={easClient}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </ApolloProvider>
    </WalletContext.Provider>
  );
}