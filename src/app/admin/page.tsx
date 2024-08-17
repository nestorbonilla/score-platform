'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label as ChartLabel, Pie, PieChart } from "recharts"
import { mascot, crHolonym, crMaps, crGmail } from "@/assets"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import Image, { StaticImageData } from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useEffect, useState } from "react"
import LocationSearch from "@/components/admin/LocationSearch"

const points = 75; // Example points value
const chartData = [
  { name: "points", value: points, fill: "hsl(var(--chart-point))" },
  { name: "remaining", value: 100 - points, fill: "hsl(var(--chart-remaining))" },
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

interface Credential {
  id: string;
  name: string;
  points: number;
  icon: StaticImageData;
  description: string;
  dialog: (() => JSX.Element) | null;
};

export default function Dashboard() {
    
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCredential, setActiveCredential] = useState<Credential | null>(null);
  
  const [crAddress, setCrAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [places, setPlaces] = useState(null);
  
  const [userAddress, setUserAddress] = useState("");

  
  useEffect(() => {
    const fetchGoogleMapData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/googleMaps?address=${crAddress}`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        console.log('Data:', data);
        setCoordinates(data.coordinates);
        setPlaces(data.placeData);
      } catch (err) {
        console.error("Error fetching google map data:", err);
        // Optionally, set an error state to display an error message to the user
      } finally {
        setIsLoading(false);
      }
    };

    if (crAddress) { // Only fetch if crAddress has a value
      fetchGoogleMapData();
    }
  }, [crAddress]);
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted");
    // Handle form submission
  };
  
  const googleMapsDialog = () => (
    <DialogContent
      className="sm:max-w-[425px]"
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Google Maps</DialogTitle>
          <DialogDescription>
            Search your address
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <LocationSearch />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">
            Submit
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
  
  const holonymDialog = () => (
    <DialogContent>
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
                    href={`https://silksecure.net/holonym/${userAddress}/gov-id/issuance/prereqs`} 
                    className="bg-teal-400 text-white py-2 px-4 rounded text-center inline-block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start KYC
                  </a>
                  <Button className="bg-teal-400 text-white">Refresh</Button>
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
  
  const credentials = [
    {
      id: "holonym",
      name: "Holonym",
      points: 20,
      icon: crHolonym,
      description: "Validates identity from official documents, without requiring additional information.",
      dialog: holonymDialog,
    },
    {
      id: "google-maps",
      name: "Google Maps",
      points: 15,
      icon: crMaps,
      description: "Validates if the business has a location, as well as ratings left by users.",
      dialog: googleMapsDialog,
    },
    {
      id: "gmail",
      name: "GMail",
      points: 15,
      icon: crGmail,
      description: "Email validation for the business or business owner.",
      dialog: null,
    }
  ];

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
                                  {points}
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
                </p>
                <p className="text-md">
                  To improve your score, we recommend you complete the credentials below.
                </p>
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
                <Image src={credential.icon} alt={credential.name} width={75} height={75} />
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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-teal-400 text-white"
                  onClick={() => setActiveCredential(credential)}
                  >Score</Button>
                </DialogTrigger>
                {dialogOpen && activeCredential && activeCredential.dialog && activeCredential.dialog()}
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}