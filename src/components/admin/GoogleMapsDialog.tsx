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

interface GoogleMapsDialogProps {
    onAddressSelect: (address: string) => void;
    onClose: () => void;
}

const GoogleMapsDialog: React.FC<GoogleMapsDialogProps> = ({ onAddressSelect, onClose }) => {
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
    const {
        userAddress,
        signer,
      } = useWallet();
    
    const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";    

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isAddressConfirmed) {
            onAddressSelect(selectedAddress);
            
            const eas = new EAS(EAS_CONTRACT_ADDRESS);
            eas.connect(signer!);
            const schemaEncoder = new SchemaEncoder("string name, string physicalAddress, string score, string reviewCount");
            const schemaUID = '0x390dae27a016f85da388c35e37a5ecba47ee2078ebff75ef36450d39e2d17409';
            // edit data
            const encodedData = schemaEncoder.encodeData([
                { name: 'name', value: "something", type: 'string' },
                { name: 'physicalAddress', value: "new address", type: 'string' },
                { name: 'score', value: "3.4", type: 'string' },
                { name: 'reviewCount', value: "5", type: 'string' }
            ]);
            const overrides = {
                gasLimit: ethers.parseUnits('200000', 'wei'), // Adjusted based on your contract's complexity
                gasPrice: ethers.parseUnits('50', 'gwei'), // Increased slightly for faster processing
            };
      
            const transaction = await eas.attest({
                schema: schemaUID,
                data: {
                  recipient: userAddress,
                  expirationTime: BigInt(0),
                  revocable: true,
                  data: encodedData
                }
              }, overrides);
            const newAttestationUID = await transaction.wait();
            console.log('New attestation UID:', newAttestationUID);
            onClose();
        }
        // You might want to add some error handling or feedback here if the address is not confirmed
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