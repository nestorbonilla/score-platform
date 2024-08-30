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
import { useEffect, useState } from "react"
import GoogleMapsDialog from "@/components/admin/GoogleMapsDialog"
import HolonymDialog from "@/components/admin/HolonymDialog"
import SmsDialog from "@/components/admin/SmsDialog"
import ClimateDialog from "@/components/admin/ClimateDialog"
import EcoDialog from "@/components/admin/EcoDialog"
import AddressdDialog from "@/components/admin/AddressDialog"
import { Icons } from "@/components/admin/icons";
 
interface Credential {
  id: string;
  name: string;
  points: number;
  image: StaticImageData | null;
  icon: JSX.Element | null;
  description: string;
};

export default function Dashboard() {

  const [holonymDialogOpen, setHolonymDialogOpen] = useState(false);
  const [googleMapsDialogOpen, setGoogleMapsDialogOpen] = useState(false); 
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [climateDialogOpen, setClimateDialogOpen] = useState(false);
  const [ecoDialogOpen, setEcoDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [scorePoints, setScorePoints] = useState(0);
  const [aprPercentage, setAprPercentage] = useState(180);

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
  
  useEffect(() => {
    // get main schema score value
    // and change score
  }, [])
  

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