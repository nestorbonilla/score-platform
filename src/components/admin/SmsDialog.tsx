'use client';
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "./WalletContext";
import { Input } from "@/components/ui/input";
import { sendVerificationCode, checkVerificationCode } from '@/app/actions/twilio';

interface SmsDialogProps {
    onClose: () => void;
}

const SmsDialog: React.FC<SmsDialogProps> = ({ onClose }) => {
  const [phone, setPhone] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isNumberConfirmed, setIsNumberConfirmed] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { smartAccount } = useWallet();
    
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isNumberConfirmed) {
          const result = await sendVerificationCode(phone);
          if (result.success) {
              setIsNumberConfirmed(true);
          } else {
              console.error(result.error);
          }
      } else if (!isVerified) {
          const result = await checkVerificationCode(phone, verificationCode);
          if (result.success) {
              setIsVerified(true);
          } else {
              console.error(result.error);
          }
      } else {
          // Run attestation script
          console.log("Running attestation script...");
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
        <DialogHeader>
          <DialogTitle>SMS Verification</DialogTitle>
          <DialogDescription> </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <Label htmlFor="phone">Verify your phone number.</Label>
            </div>
            <div className="items-center gap-4">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            {isNumberConfirmed && !isVerified && (
              <div className="items-center gap-4">
                <Label htmlFor="verificationCode">Enter the verification code.</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter the verification code"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="grid grid-cols-1 gap-4">
              <Button className="bg-teal-400 text-white" type="submit">
                {isVerified ? 'Attest' : isNumberConfirmed ? 'Confirm' : 'Verify'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
  );
};

export default SmsDialog;