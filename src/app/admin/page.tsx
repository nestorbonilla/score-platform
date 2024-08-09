'use client'
import Link from "next/link"
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
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"

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
} satisfies ChartConfig

  

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  console.log("Form submitted");
  // Handle form submission
};

const googleMapsDialog = (crAddress: string, setCrAddress: React.Dispatch<React.SetStateAction<string>>) => {
  return (
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
            <Label htmlFor="name" className="text-right">
              Address
            </Label>
            <Input
              id="name"
              required={true}
              value={crAddress}
              onChange={(event) => setCrAddress(event.target.value)}
              className="col-span-3"
            />
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
};

export default function Dashboard() {
  
  const credentials = [
    {
      id: "holonym",
      name: "Holonym",
      points: 20,
      icon: crHolonym,
      description: "Validates identity from official documents, without requiring additional information.",
      dialog: null,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crAddress, setCrAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [places, setPlaces] = useState(null);

  useEffect(() => {
    const fetchCustomerLeads = async () => {
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
        console.error("Error fetching customer leads:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerLeads();
  }, [crAddress]);
  
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
                  <Button className="w-full bg-teal-400 text-white">Score</Button>
                </DialogTrigger>
                {credential.dialog && credential.dialog(crAddress, setCrAddress)}
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}