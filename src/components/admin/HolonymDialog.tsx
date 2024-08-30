'use client';
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "./WalletContext";
import { useEffect, useState } from "react";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";


interface HolonymDialogProps {
  onClose: () => void;
}

const HolonymDialog: React.FC<HolonymDialogProps> = ({ onClose }) => {

  const { smartAccount } = useWallet();
  const [isReadyToAttest, setIsReadyToAttest] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      const actionId = 123456789;
      const resp = await fetch(`https://api.holonym.io/attestation/sbts/gov-id?action-id=${actionId}&address=${smartAccount?.accountAddress}`);
      const { isUnique, signature, circuitId } = await resp.json();

      if (isUnique) {
        // const digest = ethers.solidityPackedKeccak256(
        //   ["uint256", "uint256", "address"],
        //   [getBigInt(circuitId), getBigInt(actionId), userAddress]
        // );
        // const personalSignPreimage = ethers.solidityPackedKeccak256(
        //   ["string", "bytes32"],
        //   ["\x19Ethereum Signed Message:\n32", digest]
        // );
        // const recovered = ethers.recoverAddress(personalSignPreimage, signature);
        // setIsReadyToAttest(recovered === userAddress);
        // console.log("Ready to attest:", recovered === userAddress);
      }
    };

    fetchData();
  }, []);
  
  const attestHolonym = async () => { 
    if (isReadyToAttest) { 
      const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";
      const eas = new EAS(EAS_CONTRACT_ADDRESS);
      // eas.connect(signer!); 
      const schemaEncoder = new SchemaEncoder("string hasSBT");
      const schemaUID = ''; // Schema UID for Holonym

      const encodedData = schemaEncoder.encodeData([
        { name: 'hasSBT', value: "true", type: 'string' }
      ]);
    }
  };
  
  return (
    <DialogContent>
      <DialogHeader>
          <DialogTitle>Holonym</DialogTitle>
          <DialogDescription> </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="items-center gap-4">
          <p className="py-5">
            To start the KYC process, please click on Start KYC, follow the steps, and once completed return, and click on Attest.
          </p>
          
        </div>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4">
            <a
              href={`https://silksecure.net/holonym/diff-wallet/gov-id/issuance/prereqs`} 
              className="bg-teal-400 text-white py-2 px-4 rounded text-center inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start KYC
            </a>
            <Button className="bg-teal-400 text-white" disabled={!isReadyToAttest} onClick={attestHolonym}>Attest</Button>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};

export default HolonymDialog;