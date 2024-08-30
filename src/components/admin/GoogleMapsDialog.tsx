'use client';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSearch from "@/components/admin/LocationSearch";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useWallet } from "./WalletContext";
import { BrowserProvider, ethers } from "ethers";
import { sepolia, arbitrum } from "viem/chains";
import {
	SafeAccountV0_2_0 as SafeAccount,
	MetaTransaction,
	CandidePaymaster
} from "abstractionkit";
import { gql, useQuery } from '@apollo/client';

interface GoogleMapsDialogProps {
    onClose: () => void;
}

interface PlaceData {
    score: string;
    reviewCount: string;
}

const GET_ATTESTATION = gql`
#   query Attestations($schemaId: String!, $recipient: String!) {
    query Attestations($schemaId: String!) {
    attestations(
      where: {
        schemaId: { equals: $schemaId },
        # recipient: { equals: $recipient }
    }
      take: 1
      orderBy: { time: desc }
    ) {
      id
      attester
      data
      revocationTime
    }
  }
`;

const GoogleMapsDialog: React.FC<GoogleMapsDialogProps> = ({ onClose }) => {
    const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
    const { smartAccount, magic, magicMetadata } = useWallet();
    const [isAttesting, setIsAttesting] = useState(false);
    
    const { loading, error, data } = useQuery(GET_ATTESTATION, {
        variables: { 
            schemaId: process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID!,
            recipient: smartAccount?.accountAddress
        },
        skip: !smartAccount?.accountAddress,
        onCompleted: (data) => {
            console.log('Query completed. Data:', data);
        },
        onError: (error) => {
            console.error('GraphQL query error:', error);
        }
    });
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsAttesting(true);        
        try {
            const candideConfigResponse = await fetch('/api/candideConfig');
            const { jsonRpcNodeProvider, bundlerUrl, paymasterRPC } = await candideConfigResponse.json();    
            const eASContractAddress = process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS!; // Sepolia testnet address        
            const schemaEncoder = new SchemaEncoder(process.env.NEXT_PUBLIC_GMAPS_SCHEMA!);
            const schemaUID = process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID;
            
            const encodedData = schemaEncoder.encodeData([
                { name: 'score', value: selectedPlace?.score!, type: 'string' },
                { name: 'reviewCount', value: selectedPlace?.reviewCount!, type: 'string' }
            ]);
            
            const easInterface = new ethers.Interface([process.env.NEXT_PUBLIC_EAS_INTERFACE!]);
            const attestCallData = easInterface.encodeFunctionData("attest", [{
                schema: schemaUID,
                data: {
                    recipient: smartAccount?.accountAddress!,
                    expirationTime: BigInt(0),
                    revocable: true,
                    refUID: ethers.ZeroHash,
                    data: encodedData,
                    value: BigInt(0)
                }
            }]);        
            const transaction1: MetaTransaction = {
                to: eASContractAddress,
                value: BigInt(0),
                data: attestCallData,
            };        
            let userOperation = await smartAccount?.createUserOperation(
                [transaction1],
                jsonRpcNodeProvider,
                bundlerUrl,
            );        
            let paymaster: CandidePaymaster = new CandidePaymaster(paymasterRPC!);
            userOperation = await paymaster.createPaymasterUserOperation(userOperation!, bundlerUrl)        
            const provider = new BrowserProvider(magic!.rpcProvider);
            const ownerSigner = await provider.getSigner();
            const domain = {
                chainId: sepolia.id,
                verifyingContract: smartAccount!.safe4337ModuleAddress,
            };            
            const types = SafeAccount.EIP712_SAFE_OPERATION_TYPE;
            const { sender, ...userOp } = userOperation;
            const safeUserOperation = {
                ...userOp,
                safe: userOperation.sender,
                validUntil: BigInt(0),
                validAfter: BigInt(0),
                entryPoint: smartAccount!.entrypointAddress,
            };
            const signedHash = await ownerSigner.signTypedData(domain, types, safeUserOperation);            
            userOperation.signature =
                SafeAccount.formatEip712SignaturesToUseroperationSignature(
                    [magicMetadata?.publicAddress!],
                    [signedHash],
                );        
            const sendUserOperationResponse = await smartAccount?.sendUserOperation(
                userOperation,
                bundlerUrl,
            );
            if (sendUserOperationResponse && sendUserOperationResponse.userOperationHash) {
                onClose();
            }
        } catch (error) {
            console.error("Error during attestation:", error);
        } finally {
            setIsAttesting(false);
        }
    }
    
    const handleCheckboxChange = (checked: boolean) => {
        setIsAddressConfirmed(checked === true);
    };
    
    const handlePlaceSelect = (placeData: PlaceData) => {
        setSelectedPlace(placeData);
    };

    return (
        <DialogContent
            className="sm:max-w-[425px]"
            onInteractOutside={(e) => {
                e.preventDefault();
            }}
        >
            {isAttesting ? (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
                        <p className="text-gray-500 dark:text-gray-400">Stamping attestation onchain...</p>
                    </div>
                </div>
            ) : loading ? (
                <p>Loading existing attestation...</p>
            ) : error ? (
                <p>Error loading attestation: {error.message}</p>
            ) : data?.attestations && data.attestations.length > 0 && data.attestations[0].revocationTime == 0 ? (
                <div>
                    <DialogHeader>
                        <DialogTitle>Google Maps</DialogTitle>
                        <DialogDescription> </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="items-center gap-4">
                            <h2>Existing Valid Attestation Found</h2>
                            <p>In order to revoke this attestation and submit a new, please contact support.</p>
                        </div>
                    </div>
                    <DialogFooter>
                    <div className="grid grid-cols-1 gap-4">
                        <Button className="bg-teal-400 text-white"  onClick={onClose}>Close</Button>
                    </div>
                    </DialogFooter>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Google Maps</DialogTitle>
                        <DialogDescription> </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="items-center gap-4">
                            <Label htmlFor="address">
                                Search your address, and confirm the exact address to proceed to attest this information.
                            </Label>
                        </div>
                        <div className="items-center gap-4">
                        <LocationSearch onSelect={handlePlaceSelect} />
                        </div>
                        <div className="items-center gap-4 items-top flex space-x-2">
                        <Checkbox
                                id="terms1"
                                checked={isAddressConfirmed}
                                onCheckedChange={handleCheckboxChange}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="terms1"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I confirm the address is correct.
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                    <div className="grid grid-cols-1 gap-4">
                        <Button className="bg-teal-400 text-white" type="submit" disabled={!isAddressConfirmed}>Attest</Button>
                    </div>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
    );
};

export default GoogleMapsDialog;