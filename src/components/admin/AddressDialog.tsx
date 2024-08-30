'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EcoDialogProps {
    onClose: () => void;
}

const AddressDialog: React.FC<EcoDialogProps> = ({ onClose }) => {
  const [isProgramConfirmed, setIsProgramConfirmed] = useState(false);
    
    return (
        <DialogContent
            className="sm:max-w-[425px]"
            onInteractOutside={(e) => {
                e.preventDefault();
            }}
        >
          <DialogHeader>
            <DialogTitle>Home/Business Address</DialogTitle>
            <DialogDescription> </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
                <Label htmlFor="address">
                  This attestation is done by an onsite oracle, to request a visit, please follow this link and create an appointment.
                </Label>
                <a 
                  href="https://calendly.com/decredit/30min" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-600 mt-2 inline-block"
                >
                  Schedule an appointment
                </a>
            </div>
          </div>
          <DialogFooter>
          <div className="grid grid-cols-1 gap-4">
              <Button className="bg-teal-400 text-white" onClick={onClose}>Done</Button>
          </div>
          </DialogFooter>
        </DialogContent>
    );
};

export default AddressDialog;