"use client";
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label as ChartLabel, Pie, PieChart } from "recharts"
import { mascot } from "@/assets"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import Image, { StaticImageData } from "next/image"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { gql, useQuery } from '@apollo/client';
import { getAddress } from 'viem';
import { useEffect, useState } from 'react';
import GoogleMapsDialog from "@/components/admin/GoogleMapsDialog"
import HolonymDialog from "@/components/admin/HolonymDialog"
import SmsDialog from "@/components/admin/SmsDialog"
import ClimateDialog from "@/components/admin/ClimateDialog"
import EcoDialog from "@/components/admin/EcoDialog"
import AddressdDialog from "@/components/admin/AddressDialog"
import { Icons } from "@/components/admin/icons";
import { useWallet } from "@/components/admin/WalletContext";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { BrowserProvider, ethers } from "ethers";
import { sepolia } from "viem/chains";
import {
	SafeAccountV0_2_0 as SafeAccount,
	MetaTransaction,
	CandidePaymaster
} from "abstractionkit";
 
interface Credential {
  id: string;
  name: string;
  points: number;
  image: StaticImageData | null;
  icon: JSX.Element | null;
  description: string;
};

const GET_ATTESTATIONS = gql`
  query AttestationsForSchemas($schemaIds: [String!]!, $recipient: String!) {
    attestations: attestations(
      where: {
        schemaId: { in: $schemaIds },
        recipient: { equals: $recipient }
      },
      orderBy: { time: desc }
    ) {
      id
      attester
      recipient
      refUID
      revocable
      revocationTime
      expirationTime
      data
      schemaId
      time
    }
  }
`;

export default function Dashboard() {

  const [holonymDialogOpen, setHolonymDialogOpen] = useState(false);
  const [googleMapsDialogOpen, setGoogleMapsDialogOpen] = useState(false); 
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [climateDialogOpen, setClimateDialogOpen] = useState(false);
  const [ecoDialogOpen, setEcoDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [scorePoints, setScorePoints] = useState(0);
  const [aprPercentage, setAprPercentage] = useState(180);
  const { smartAccount, magic, magicMetadata } = useWallet();
  const [decodedAttestations, setDecodedAttestations] = useState({});
  const [enableToUpdateScore, setEnableToUpdateScore] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);

  const chartData = [
    { name: "points", value: scorePoints, fill: "hsl(var(--chart-point))" },
    { name: "remaining", value: 100 - scorePoints, fill: "hsl(var(--chart-remaining))" },
  ]
  
  const chartConfig = {
    points: {
      label: "Points",
      color: "hsl(var(--chart-point))",
    },
    remaining: {
      label: "Remaining",
      color: "hsl(var(--chart-remaining))",
    },
  } satisfies ChartConfig;
  
  const credentials : Credential[] = [
    {
      id: "holonym",
      name: "Holonym",
      points: 10,
      image: null,
      icon: <Icons.holonym className="h-14 w-14"/>,
      description: "Validates identity from official documents, without requiring additional information.",
    },
    {
      id: "google-maps",
      name: "Google Maps",
      points: 10,
      image: null,
      icon: <Icons.gmaps className="h-14 w-14"/>,
      description: "Validates if the business has a location, as well as ratings left by users."
    },
    {
      id: "address",
      name: "Home/Business Address",
      points: 10,
      image: null,
      icon: <Icons.address className="h-14 w-14"/>,
      description: "Verify your home or business address with an onsite oracle."
    },
    {
      id: "sms",
      name: "Phone Number",
      points: 10,
      image: null,
      icon: <Icons.phone className="h-14 w-14"/>,
      description: "SMS validation for the business or business owner."
    },
    {
      id: "climate-resilience",
      name: "Climate Resilience",
      points: 10,
      image: null,
      icon: <Icons.climateResilience className="h-14 w-14"/>,
      description: "Climate Resilience educational program attendance."
    },
    {
      id: "eco-tech",
      name: "Eco Tech Adoption",
      points: 10,
      image: null,
      icon: <Icons.ecoTech className="h-14 w-14"/>,
      description: "Best practices adopted program attendance."
    }
  ];
  
  const schemaIds = [
    process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID,
    process.env.NEXT_PUBLIC_SMS_SCHEMA_ID,
    process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ID,
    process.env.NEXT_PUBLIC_ECO_SCHEMA_ID,
    process.env.NEXT_PUBLIC_ADDRESS_SCHEMA_ID,
    process.env.NEXT_PUBLIC_KYC_SCHEMA_ID,
    process.env.NEXT_PUBLIC_MAIN_SCHEMA_ID, // excluded for score calculation
  ].filter(Boolean) as string[];

  const { loading, error, data } = useQuery(GET_ATTESTATIONS, {
    variables: { 
      schemaIds: schemaIds,
      recipient: smartAccount?.accountAddress ? getAddress(smartAccount.accountAddress) : ''
    },
    skip: !smartAccount?.accountAddress,
  });

  useEffect(() => {
    if (data && data.attestations) {
      // Process the results to get the first attestation for each schemaId
      const latestAttestationsMap = data.attestations.reduce((acc: any, attestation: any) => {
        const { schemaId } = attestation;
        if (!acc[schemaId] || new Date(attestation.time) > new Date(acc[schemaId].time)) {
          acc[schemaId] = attestation;
        }
        return acc;
      }, {});

      // Decode the data for each latest attestation
      const decodedAttestationsMap = Object.entries(latestAttestationsMap).reduce((acc: any, [schemaId, attestation]: [string, any]) => {
        let schemaString;
        switch(schemaId) {
          case process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID:
            schemaString = process.env.NEXT_PUBLIC_GMAPS_SCHEMA;
            break;
          case process.env.NEXT_PUBLIC_SMS_SCHEMA_ID:
            schemaString = process.env.NEXT_PUBLIC_SMS_SCHEMA;
            break;
          case process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ID:
            schemaString = process.env.NEXT_PUBLIC_CLIMATE_SCHEMA;
            break;
          case process.env.NEXT_PUBLIC_ECO_SCHEMA_ID:
            schemaString = process.env.NEXT_PUBLIC_ECO_SCHEMA;
            break;
          case process.env.NEXT_PUBLIC_ADDRESS_SCHEMA_ID:
            schemaString = process.env.NEXT_PUBLIC_ADDRESS_SCHEMA;
            break;
          case process.env.NEXT_PUBLIC_KYC_SCHEMA_ID:
            schemaString = process.env.NEXT_PUBLIC_KYC_SCHEMA;
            break;
          case process.env.NEXT_PUBLIC_MAIN_SCHEMA_ID:
            schemaString = process.env.NEXT_PUBLIC_MAIN_SCHEMA;
            break;
          default:
            console.error(`No schema string found for schemaId: ${schemaId}`);
            return acc;
        }

        try {
          const schemaEncoder = new SchemaEncoder(schemaString!);
          const decodedData = schemaEncoder.decodeData(attestation.data);
          acc[schemaId] = {
            ...attestation,
            decodedData: decodedData
          };
          if (schemaId == process.env.NEXT_PUBLIC_MAIN_SCHEMA_ID) {
            // reference of main schema
            // 'bool mapAttestation, string mapAttestationScore, bool smsAttestation, string smsAttestationScore, bool climateAttestation, string climateAttestationScore, bool ecoAttestation, string ecoAttestationScore, bool addressAttestation, string addressAttestationScore'
            let mapValue = parseInt(decodedData[1].value.value.toString());
            let smsValue = parseInt(decodedData[3].value.value.toString());
            let climateValue = parseInt(decodedData[5].value.value.toString());
            let ecoValue = parseInt(decodedData[7].value.value.toString());
            let addressValue = parseInt(decodedData[9].value.value.toString());
            let newScorePoints = mapValue + smsValue + climateValue + ecoValue + addressValue;
            
            setScorePoints(newScorePoints);
            setAprPercentage(calculateAPR(newScorePoints));
          }
        } catch (error) {
          console.error(`Error decoding data for schemaId ${schemaId}:`, error);
          acc[schemaId] = attestation;
        }

        return acc;
      }, {});

      setDecodedAttestations(decodedAttestationsMap);
      setEnableToUpdateScore(true);
      console.log('Decoded attestations:', decodedAttestationsMap);
    }
  }, [data]);
  
  const createScoreAttestation = async () => {
    setIsAttesting(true);
    try {
      // Calculate the score based on decodedAttestations
      const credentialSchemaIds = [
        process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID,
        process.env.NEXT_PUBLIC_SMS_SCHEMA_ID,
        process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ID,
        process.env.NEXT_PUBLIC_ECO_SCHEMA_ID,
        process.env.NEXT_PUBLIC_ADDRESS_SCHEMA_ID,
        process.env.NEXT_PUBLIC_KYC_SCHEMA_ID,
      ].filter(Boolean) as string[];
  
      let score = 0;
      let mapAttestation = false;
      let smsAttestation = false;
      let climateAttestation = false;
      let ecoAttestation = false;
      let addressAttestation = false;
      let kycAttestation = false;
  
      Object.values(decodedAttestations).forEach((attestation: any) => {
        if (credentialSchemaIds.includes(attestation.schemaId) && attestation.decodedData) {
          score += 10;
          switch (attestation.schemaId) {
            case process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID:
              mapAttestation = true;
              console.log(`Added 10 points for Google Maps attestation`);
              break;
            case process.env.NEXT_PUBLIC_SMS_SCHEMA_ID:
              smsAttestation = true;
              console.log(`Added 10 points for SMS attestation`);
              break;
            case process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ID:
              climateAttestation = true;
              console.log(`Added 10 points for Climate attestation`);
              break;
            case process.env.NEXT_PUBLIC_ECO_SCHEMA_ID:
              ecoAttestation = true;
              console.log(`Added 10 points for Eco attestation`);
              break;
            case process.env.NEXT_PUBLIC_ADDRESS_SCHEMA_ID:
              addressAttestation = true;
              console.log(`Added 10 points for Address attestation`);
              break;
            case process.env.NEXT_PUBLIC_KYC_SCHEMA_ID:
              kycAttestation = true;
              console.log(`Added 10 points for KYC attestation`);
              break;
          }
        }
      });
  
      console.log(`Total score: ${score}`);
      
      console.log('updated score will be ', score);
  
      const candideConfigResponse = await fetch('/api/candideConfig');
      const { jsonRpcNodeProvider, bundlerUrl, paymasterRPC } = await candideConfigResponse.json();    
      const eASContractAddress = process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS!;
      const schemaEncoder = new SchemaEncoder(process.env.NEXT_PUBLIC_MAIN_SCHEMA!);
      const schemaUID = process.env.NEXT_PUBLIC_MAIN_SCHEMA_ID;
      
      const encodedData = schemaEncoder.encodeData([
        { name: 'mapAttestation', value: mapAttestation, type: 'bool' },
        { name: 'mapAttestationScore', value: mapAttestation ? "10" : "0", type: 'string' },
        { name: 'smsAttestation', value: smsAttestation, type: 'bool' },
        { name: 'smsAttestationScore', value: smsAttestation ? "10" : "0", type: 'string' },
        { name: 'climateAttestation', value: climateAttestation, type: 'bool' },
        { name: 'climateAttestationScore', value: climateAttestation ? "10" : "0", type: 'string' },
        { name: 'ecoAttestation', value: ecoAttestation, type: 'bool' },
        { name: 'ecoAttestationScore', value: ecoAttestation ? "10" : "0", type: 'string' },
        { name: 'addressAttestation', value: addressAttestation, type: 'bool' },
        { name: 'addressAttestationScore', value: addressAttestation ? "10" : "0", type: 'string' },
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
        console.log("Score attestation created successfully");
      }
    } catch (error) {
      console.error("Error during score attestation:", error);
    } finally {
      setIsAttesting(false);
    }
  };
  
  const calculateAPR = (score: number): number => {
    if (score <= 10) return 180;
    if (score <= 20) return 170;
    if (score <= 30) return 150;
    if (score <= 40) return 120;
    if (score <= 50) return 90;
    if (score <= 60) return 80;
    return 180;
  };
  
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-teal-400 mb-6">My Score</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="dark:bg-slate-800 border-teal-400 border-2 lg:col-span-2">
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square w-full max-w-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <ChartLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {scorePoints}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Points
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="sm:col-span-2 flex flex-col justify-center">
                <p className="text-md mb-4">
                  This is your <span className="text-teal-400">Unique Credit Score</span>. 
                  It is based on a 100-point scale and validates your business and credit activity.
                  Also, you have a {aprPercentage}% APR based on the credit score.
                </p>
                <p className="text-md">
                  To improve your score, we recommend you complete the credentials below.
                </p>
                <div className="grid grid-cols-1 gap-4 mt-4">
                        <Button className="bg-teal-400 text-white" disabled={!enableToUpdateScore} onClick={createScoreAttestation}>Update Score</Button>
                    </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          <Image src={mascot} alt="Credit Score" width={130} height={130} />
        </div>
      </div>
      <h1 className="my-12 text-3xl font-semibold text-teal-400 mb-6">Credentials</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {credentials.map((credential) => (
          <Card key={credential.id} className="dark:bg-slate-800 border-teal-400 border-2">
            <div className="grid gap-6 grid-cols-3">
              <div className="col-span-2">
                <CardHeader>
                  <CardTitle>{credential.name}</CardTitle>
                  <CardDescription className="text-3xl text-teal-400 font-bold">
                    {credential.points.toFixed(1)} points
                  </CardDescription>
                </CardHeader>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                {credential.icon ?
                  <div className="bg-white rounded-full p-2">{credential.icon}</div> : 
                  <Image src={credential.image!} alt={credential.name} width={75} height={75} />
                }
              </div>
            </div>
            <CardContent>            
              <div className="flex flex-col justify-center">
                <p className="text-md">
                  {credential.description}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {credential.id === "holonym" && (
                <Dialog open={holonymDialogOpen} onOpenChange={setHolonymDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-teal-400 text-white">Score</Button>
                  </DialogTrigger>
                  <HolonymDialog onClose={() => setHolonymDialogOpen(false)} />                  
                </Dialog>
              )}
              {credential.id === "google-maps" && (
                <Dialog open={googleMapsDialogOpen} onOpenChange={setGoogleMapsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-teal-400 text-white">
                      Score
                    </Button>
                  </DialogTrigger>
                  <GoogleMapsDialog onClose={() => setGoogleMapsDialogOpen(false)} />
                </Dialog>
              )}
              {credential.id === "sms" && (
                <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-teal-400 text-white">
                      Score
                    </Button>
                  </DialogTrigger>
                  <SmsDialog onClose={() => setSmsDialogOpen(false)} />
              </Dialog>
              )}
              {credential.id === "climate-resilience" && (
                <Dialog open={climateDialogOpen} onOpenChange={setClimateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-teal-400 text-white">
                      Score
                    </Button>
                  </DialogTrigger>
                  <ClimateDialog onClose={() => setClimateDialogOpen(false)} />
              </Dialog>
              )}
              {credential.id === "eco-tech" && (
                <Dialog open={ecoDialogOpen} onOpenChange={setEcoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-teal-400 text-white">
                      Score
                    </Button>
                  </DialogTrigger>
                  <EcoDialog onClose={() => setEcoDialogOpen(false)} />
              </Dialog>
              )}
              {credential.id === "address" && (
                <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-teal-400 text-white">
                      Score
                    </Button>
                  </DialogTrigger>
                  <AddressdDialog onClose={() => setAddressDialogOpen(false)} />
              </Dialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}