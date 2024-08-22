'use client';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "./WalletContext";
import { Input } from "../ui/input";

interface WhatsappDialogProps {
    onAddressSelect: (address: string) => void;
    onClose: () => void;
}

const WhatsappDialog: React.FC<WhatsappDialogProps> = ({ onAddressSelect, onClose }) => {
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [isNumberConfirmed, setIsNumberConfirmed] = useState(false);
    const {
        smartAccount,
      } = useWallet();
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isNumberConfirmed) {
            onAddressSelect(selectedAddress);
            
            
            onClose();
        }
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
                    <DialogTitle>Whatsapp Verification</DialogTitle>
                    <DialogDescription> </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="items-center gap-4">
                        <Label htmlFor="address">
                            Verify your Whatsapp number.
                        </Label>
                    </div>
                    <div className="items-center gap-4">
                        <Input />
                    </div>
                    
                </div>
                <DialogFooter>
                  <div className="grid grid-cols-1 gap-4">
                    <Button className="bg-teal-400 text-white" type="submit">Attest</Button>
                  </div>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

export default WhatsappDialog;