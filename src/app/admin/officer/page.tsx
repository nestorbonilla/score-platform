"use client";
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Image, { StaticImageData } from "next/image"
import { useEffect, useState } from "react"
import { Icons } from "@/components/admin/icons";
import { gql, useQuery } from '@apollo/client';
 
interface Credential {
  id: string;
  name: string;
  schemaId: string;
  icon: JSX.Element;
  description: string;
};

const GET_ATTESTATION = gql`
  query Attestations($schemaIds: [String!]!) {
    attestations(
      where: {
        schemaId: { in: $schemaIds }
      }
      take: 1000
      orderBy: { time: desc }
    ) {
      id
      schemaId
    }
  }
`;

export default function OfficerPage() {

  const [attestationCounts, setAttestationCounts] = useState<{[key: string]: number}>({});
  
  const { loading, error, data } = useQuery(GET_ATTESTATION, {
    variables: { 
      schemaIds: [
        process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID,
        process.env.NEXT_PUBLIC_SMS_SCHEMA_ID,
        process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ID,
        process.env.NEXT_PUBLIC_ECO_SCHEMA_ID,
      ]
    },
    onCompleted: (data) => {
      console.log('Officer => Query completed. Data:', data);
      const counts = data.attestations.reduce((acc: {[key: string]: number}, attestation: { schemaId: string }) => {
        acc[attestation.schemaId] = (acc[attestation.schemaId] || 0) + 1;
        return acc;
      }, {});
      setAttestationCounts(counts);
    },
    onError: (error) => {
      console.error('Officer => GraphQL query error:', error);
    }
  });
  
  const credentials : Credential[] = [
    {
      id: "google-maps",
      name: "Google Maps",
      schemaId: process.env.NEXT_PUBLIC_GMAPS_SCHEMA_ID!,
      icon: <Icons.gmaps className="h-14 w-14"/>,
      description: "Validates if the business has a location, as well as ratings left by users."
    },
    {
      id: "sms",
      name: "Phone Number",
      schemaId: process.env.NEXT_PUBLIC_SMS_SCHEMA_ID!,
      icon: <Icons.phone className="h-14 w-14"/>,
      description: "SMS validation for the business or business owner."
    },
    {
      id: "address",
      name: "Home/Business Address",
      schemaId: process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ID!,
      icon: <Icons.address className="h-14 w-14"/>,
      description: "Verify your home or business address with an onsite oracle."
    },
    {
      id: "climate-resilience",
      name: "Climate Resilience",
      schemaId: process.env.NEXT_PUBLIC_CLIMATE_SCHEMA_ID!,
      icon: <Icons.climateResilience className="h-14 w-14"/>,
      description: "Climate Resilience educational program attendance."
    },
    {
      id: "eco-tech",
      name: "Eco Tech Adoption",
      schemaId: process.env.NEXT_PUBLIC_ECO_SCHEMA_ID!,
      icon: <Icons.ecoTech className="h-14 w-14"/>,
      description: "Best practices adopted program attendance."
    }
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 className="my-12 text-3xl font-semibold text-teal-400 mb-6">Total Stamps by Credentials</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {credentials.map((credential) => (
          <Card key={credential.id} className="dark:bg-slate-800 border-teal-400 border-2">
            <div className="grid gap-6 grid-cols-3">
              <div className="col-span-2">
                <CardHeader>
                  <CardTitle>{credential.name}</CardTitle>
                  <CardDescription className="text-3xl text-teal-400 font-bold">
                    {attestationCounts[credential.schemaId] || 0} stamps
                  </CardDescription>
                </CardHeader>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <div className="bg-white rounded-full p-3">{credential.icon}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}