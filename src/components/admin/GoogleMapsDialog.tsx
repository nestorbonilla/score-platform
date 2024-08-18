'use client';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSearch from "@/components/admin/LocationSearch";

interface GoogleMapsDialogProps {
    onAddressSelect: (address: string) => void;
    onClose: () => void;
}

const GoogleMapsDialog: React.FC<GoogleMapsDialogProps> = ({ onAddressSelect, onClose }) => {
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isAddressConfirmed) {
            onAddressSelect(selectedAddress);
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