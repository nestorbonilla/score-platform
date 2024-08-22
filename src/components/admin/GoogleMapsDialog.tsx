'use client';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSearch from "@/components/admin/LocationSearch";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useWallet } from "./WalletContext";
import { ethers } from "ethers";
import { SafeAccountV0_2_0 as SafeAccount, MetaTransaction } from "abstractionkit";
import { sepolia, arbitrum } from "viem/chains";
import { createWalletClient, custom } from "viem";

interface GoogleMapsDialogProps {
    onAddressSelect: (address: string) => void;
    onClose: () => void;
}

const GoogleMapsDialog: React.FC<GoogleMapsDialogProps> = ({ onAddressSelect, onClose }) => {
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
    const {
        smartAccount,
        magic
    } = useWallet();
    
    const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // ethereum sepolia
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isAddressConfirmed) {
            onAddressSelect(selectedAddress);
            
            // flow on candide wallet
            const jsonRpcNodeProvider = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
            const bundlerUrl = "https://sepolia.voltaire.candidewallet.com/rpc";

            // EAS attestation data preparation
            const schemaEncoder = new SchemaEncoder("string name, string physicalAddress, string score, string reviewCount");
            // Ethereum Sepolia
            const schemaUID = '0x390dae27a016f85da388c35e37a5ecba47ee2078ebff75ef36450d39e2d17409'
            
            const encodedData = schemaEncoder.encodeData([
                { name: 'name', value: "something", type: 'string' },
                { name: 'physicalAddress', value: selectedAddress, type: 'string' },
                { name: 'score', value: "3.4", type: 'string' },
                { name: 'reviewCount', value: "5", type: 'string' }
            ]);

            // Construct the attestationRequestData object
            const attestationRequestData = {
                recipient: smartAccount?.accountAddress!, 
                expirationTime: BigInt(0), 
                revocable: true, 
                refUID: ethers.ZeroHash, 
                data: encodedData,
                value: BigInt(0),
            };

            // Construct the AttestationRequest object
            const attestationRequest = {
                schema: schemaUID,
                data: attestationRequestData,
            };

            // Encode the attest function call
            const easInterface = new ethers.Interface([
                "function attest(AttestationRequest calldata request) external payable returns (bytes32)" 
            ]);
            const transactionData = easInterface.encodeFunctionData("attest", [attestationRequest]); 
            
            const transaction: MetaTransaction = {
                to: EAS_CONTRACT_ADDRESS,
                value: BigInt(0),
                data: transactionData
            }

            let userOperation = await smartAccount!.createUserOperation(
                [transaction],
                jsonRpcNodeProvider,
                bundlerUrl,
            )

            const domain = {
                chainId: sepolia.id,
                verifyingContract: smartAccount!.safe4337ModuleAddress as `0x${string}`,
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
            
            const magicSmartAccountOwner = createWalletClient({
                transport: custom(magic!.rpcProvider),
            });
            const signature = await magicSmartAccountOwner.signTypedData({
                domain,
                types,
                primaryType: 'SafeOp',
                message: safeUserOperation,
                account: smartAccount?.accountAddress! as `0x${string}`
            });
            const formatedSig = SafeAccount.formatEip712SignaturesToUseroperationSignature([smartAccount?.accountAddress!], [signature]);
            userOperation.signature = formatedSig;
            onClose();            
        }
    };
    
    const handleCheckboxChange = (checked: boolean) => {
      setIsAddressConfirmed(checked === true);
    };

    return (
        <DialogContent
            className="sm:max-w-[425px]"
            onInteractOutside={(e) => {
                e.preventDefault();
            }}
        >
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
                        <LocationSearch onSelect={(address) => setSelectedAddress(address)} />
                    </div>
                    <div className="items-center gap-4 items-top flex space-x-2">
                    <Checkbox
                            id="terms1"
                            checked={isAddressConfirmed}
                            onCheckedChange={handleCheckboxChange} // Use the new handler
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
        </DialogContent>
    );
};

export default GoogleMapsDialog;