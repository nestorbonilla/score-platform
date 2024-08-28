'use client';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSearch from "@/components/admin/LocationSearch";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useWallet } from "./WalletContext";
import { BrowserProvider, ethers, getBytes, getDefaultProvider, Wallet } from "ethers";
import { sepolia, arbitrum } from "viem/chains";
import { createWalletClient, custom, toBytes, stringToBytes } from "viem";
import {
	SafeAccountV0_3_0 as SafeAccount,
	MetaTransaction,
	calculateUserOperationMaxGasCost,
	CandidePaymaster,
	getFunctionSelector,
	createCallData,
} from "abstractionkit";

interface GoogleMapsDialogProps {
    onAddressSelect: (address: string) => void;
    onClose: () => void;
}

const GoogleMapsDialog: React.FC<GoogleMapsDialogProps> = ({ onAddressSelect, onClose }) => {
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
    const {
        smartAccount,
        magic,
        magicMetadata
    } = useWallet();
    
    const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // ethereum sepolia
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isAddressConfirmed) {
            onAddressSelect(selectedAddress);
            
            // flow on candide wallet
            const jsonRpcNodeProvider = process.env.RPC_ENDPOINT;
            const bundlerUrl = process.env.BUNDLE_URL;

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
                "function attest((bytes32 schema, (address recipient, uint256 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) external payable returns (bool)",
            ]);
            const transactionData = easInterface.encodeFunctionData("attest", [attestationRequest]); 
            
            // const transaction: MetaTransaction = {
            //     to: EAS_CONTRACT_ADDRESS,
            //     value: BigInt(0),
            //     data: transactionData
            // }
            const transaction: MetaTransaction = {
                to: '0x7Fd4eD1b927E8ccBaF8174F66e20aAFDa99fdb61',
                value: BigInt(1),
                data: '0x'
            };

            let userOperation = await smartAccount!.createUserOperation(
                [transaction],
                jsonRpcNodeProvider,
                bundlerUrl,
            )

            // const domain = {
            //     chainId: sepolia.id,
            //     verifyingContract: smartAccount!.safe4337ModuleAddress as `0x${string}`,
            // };
            
            // const types = SafeAccount.EIP712_SAFE_OPERATION_TYPE;
            
            // const { sender, ...userOp } = userOperation;
            
            // const safeUserOperation = {
            //     ...userOp,
            //     safe: userOperation.sender,
            //     validUntil: BigInt(0),
            //     validAfter: BigInt(0),
            //     entryPoint: smartAccount!.entrypointAddress,
            // };
            
            const magicSmartAccountOwner = createWalletClient({
                transport: custom(magic!.rpcProvider),
            });
            
            console.log("magicSmartAccountOwner", magicSmartAccountOwner);
            const provider = new BrowserProvider(magic!.rpcProvider);
            const magicSmartAccountOwner2 = await provider.getSigner();
            // console.log(await magicSmartAccountOwner.getAddresses());
            // const magicAddress = await magicSmartAccountOwner.getAddresses();
            // const userOpHash = stringToBytes(createUserOperationHash(userOperation, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", BigInt(sepolia.id)));
            // const upserOpHash = getBytes(createUserOperationHash(userOperation, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", BigInt(sepolia.id)));
            
            // const signature = await magicSmartAccountOwner2.signMessage(upserOpHash);
              
            // console.log("some", some);
            // const signature = await magicSmartAccountOwner.signTypedData({
            //     domain,
            //     types,
            //     primaryType: 'SafeOp',
            //     message: safeUserOperation,
            //     account: smartAccount?.accountAddress! as `0x${string}`
            // });
            // console.log("signature", signature);
            // const formatedSig = SafeAccount.formatEip712SignaturesToUseroperationSignature([smartAccount?.accountAddress!], [signature]);
            // userOperation.signature = formatedSig;
            // userOperation.signature = signature;
            // const sendUserOperation = await smartAccount!.sendUserOperation(userOperation, bundlerUrl);
            // const receiptOperation = await sendUserOperation.included();
            // console.log("receiptOperation", receiptOperation);
            onClose();            
        }
    };
    
    const nftMint = async () => {
    
        const chainId = BigInt(11155111);
        const jsonRpcNodeProvider = process.env.RPC_ENDPOINT;
        const bundlerUrl = process.env.BUNDLE_URL;
        const paymasterRPC = process.env.PAYMASTER_RPC;

        const nftContractAddress = "0x9a7af758aE5d7B6aAE84fe4C5Ba67c041dFE5336";
        const mintFunctionSignature = "mint(address)";
        const mintFunctionSelector = getFunctionSelector(mintFunctionSignature);
        const mintTransactionCallData = createCallData(
            mintFunctionSelector,
            ["address"],
            [smartAccount?.accountAddress!],
        );
        const transaction1: MetaTransaction = {
            to: nftContractAddress,
            value: BigInt(0),
            data: mintTransactionCallData,
        };

        //createUserOperation will determine the nonce, fetch the gas prices,
        //estimate gas limits and return a useroperation to be signed.
        //you can override all these values using the overrides parameter.
        let userOperation = await smartAccount?.createUserOperation(
            [
                transaction1,
            ],
            jsonRpcNodeProvider, //the node rpc is used to fetch the current nonce and fetch gas prices.
            bundlerUrl, //the bundler rpc is used to estimate the gas limits.
        );

        let paymaster: CandidePaymaster = new CandidePaymaster(paymasterRPC!);

        let [paymasterUserOperation, _sponsorMetadata] =
            await paymaster.createSponsorPaymasterUserOperation(
                userOperation!,
                bundlerUrl,
            );
        userOperation = paymasterUserOperation;

        const cost = calculateUserOperationMaxGasCost(userOperation);
        console.log("This useroperation may cost upto : " + cost + " wei");

        // Replace with Magic provider/signer
        // const provider = getDefaultProvider(jsonRpcNodeProvider);
        // const ownerSigner = new Wallet(ownerPrivateKey, provider);
        // Replace with Magic provider/signer
        
        // Replace with Magic provider/signer
        const provider = new BrowserProvider(magic!.rpcProvider);
        const ownerSigner = await provider.getSigner();
        // Replace with Magic provider/signer

        // error
        // const userOphash = SafeAccount.getUserOperationEip712Hash(
        //     userOperation,
        //     chainId,
        // );
        // const signedHash = ownerSigner.signTransaction(userOphash).serialized;

        // userOperation.signature =
        //     SafeAccount.formatEip712SignaturesToUseroperationSignature(
        //         [magicMetadata?.publicAddress!],
        //         [signedHash],
        //     );

        // const sendUserOperationResponse = await smartAccount?.sendUserOperation(
        //     userOperation,
        //     bundlerUrl,
        // );
        }
        
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