'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sendVerificationCode, checkVerificationCode } from '@/app/actions/twilio';
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useWallet } from "@/components/admin/WalletContext";
import { BrowserProvider, ethers } from "ethers";
import { sepolia, arbitrum } from "viem/chains";
import {
	SafeAccountV0_2_0 as SafeAccount,
	MetaTransaction,
	CandidePaymaster
} from "abstractionkit";
import { gql, useQuery } from '@apollo/client';

interface SmsDialogProps {
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

const SmsDialog: React.FC<SmsDialogProps> = ({ onClose }) => {
  const [phone, setPhone] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [step, setStep] = useState<'phone' | 'code' | 'attest'>('phone');
  const { smartAccount, magic, magicMetadata } = useWallet();
  const [isAttesting, setIsAttesting] = useState(false);

  const { loading, error, data } = useQuery(GET_ATTESTATION, {
    variables: { 
        schemaId: process.env.NEXT_PUBLIC_SMS_SCHEMA_ID!,
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

  const handleVerifyPhone = async () => {
    try {
      const result = await sendVerificationCode(phone);
      if (result.success) {
        setStep('code');
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const result = await checkVerificationCode(phone, verificationCode);
      if (result.success) {
        setStep('attest');
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error checking verification code:", error);
    }
  };

  const handleAttest = async () => {
    setIsAttesting(true);
    try {
      const candideConfigResponse = await fetch('/api/candideConfig');
      const { jsonRpcNodeProvider, bundlerUrl, paymasterRPC } = await candideConfigResponse.json();    
      const eASContractAddress = process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS!;
      const schemaEncoder = new SchemaEncoder(process.env.NEXT_PUBLIC_SMS_SCHEMA!);
      const schemaUID = process.env.NEXT_PUBLIC_SMS_SCHEMA_ID;
      
      const encodedData = schemaEncoder.encodeData([
        { name: 'phoneActive', value: true, type: 'bool' },
        { name: 'verificationProvider', value: 'twilio', type: 'string' }
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
      } else {
          throw new Error("Failed to send user operation");
      }
    } catch (error) {
      console.error("Error during attestation:", error);
    } finally {
      setIsAttesting(false);
    }
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
            <DialogTitle>SMS Verification</DialogTitle>
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
              <Button className="bg-teal-400 text-white" onClick={onClose}>Close</Button>
            </div>
          </DialogFooter>
        </div>
      ) : (
        <div>
          <DialogHeader>
            <DialogTitle>SMS Verification</DialogTitle>
            <DialogDescription> </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {step === 'phone' && (
              <>
                <Label htmlFor="phone">Verify your phone number.</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
                <Button className="bg-teal-400 text-white" onClick={handleVerifyPhone}>
                  Verify
                </Button>
              </>
            )}
            {step === 'code' && (
              <>
                <Label htmlFor="verificationCode">Enter the verification code.</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter the verification code"
                />
                <Button className="bg-teal-400 text-white" onClick={handleVerifyCode}>
                  Confirm
                </Button>
              </>
            )}
            {step === 'attest' && (
              <Button className="bg-teal-400 text-white" onClick={handleAttest}>
                Attest
              </Button>
            )}
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default SmsDialog;