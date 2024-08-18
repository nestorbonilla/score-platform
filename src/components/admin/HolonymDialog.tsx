'use client';

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { useWallet } from "./WalletContext";

interface HolonymDialogProps {
  onClose: () => void; // Callback to close the dialog
}

const HolonymDialog: React.FC<HolonymDialogProps> = ({ onClose }) => {

  const { connected, walletClient, userAddress } = useWallet();
  
  return (
    <DialogContent>
      <DialogHeader>
          <DialogTitle>Holonym</DialogTitle>
          <DialogDescription> </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="kyc" className="w-full pt-5">
        <TabsList className="w-full flex justify-between">
          <TabsTrigger value="kyc" className="flex-1 text-center">KYC</TabsTrigger>
          <TabsTrigger value="attestation" className="flex-1 text-center">Attestation</TabsTrigger>
        </TabsList>
        <TabsContent value="kyc">
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <p className="py-5">
                To start the KYC process, please press the following button, follow the steps, and once completed return, and click, refresh.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href={`https://silksecure.net/holonym/${userAddress}/idgov/issuance/prereqs`} 
                  className="bg-teal-400 text-white py-2 px-4 rounded text-center inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start KYC
                </a>
                <Button className="bg-teal-400 text-white" onClick={onClose}>Refresh</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="attestation">
        <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <p className="py-5">
                Attestation flow.
              </p>
              
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};

export default HolonymDialog;