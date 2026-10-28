import type { Meta, StoryObj } from "@storybook/react-vite"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "Jun", production: 186, preview: 80 },
  { month: "Jul", production: 305, preview: 200 },
  { month: "Aug", production: 237, preview: 120 },
  { month: "Sep", production: 273, preview: 190 },
  { month: "Oct", production: 209, preview: 130 },
  { month: "Nov", production: 314, preview: 240 },
]
const config = {
  production: { label: "Production", color: "var(--chart-1)" },
  preview: { label: "Preview", color: "var(--chart-2)" },
} satisfies ChartConfig

const meta = { title: "Components/Charts & media", component: ChartContainer, tags: ["autodocs"] } satisfies Meta<typeof ChartContainer>
export default meta
type Story = StoryObj<typeof meta>

export const BarChartStory: Story = {
  name: "Chart — bars",
  args: { config, children: <></> },
  render: () => (
    <Card className="max-w-xl">
      <CardHeader><CardTitle>Deployments</CardTitle><CardDescription>June – November 2026</CardDescription></CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[240px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="production" fill="var(--color-production)" radius={4} />
            <Bar dataKey="preview" fill="var(--color-preview)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

export const AreaChartStory: Story = {
  name: "Chart — area",
  args: { config, children: <></> },
  render: () => (
    <Card className="max-w-xl">
      <CardHeader><CardTitle>Production deploys</CardTitle><CardDescription>Per month</CardDescription></CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[220px] w-full">
          <AreaChart data={data} accessibilityLayer margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area dataKey="production" type="monotone" fill="var(--color-production)" fillOpacity={0.25} stroke="var(--color-production)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

export const CarouselStory: Story = {
  name: "Carousel",
  args: { config, children: <></> },
  render: () => (
    <div className="px-12">
      <Carousel opts={{ align: "start" }} className="max-w-xl">
        <CarouselContent>
          {[1, 2, 3, 4, 5].map((n) => (
            <CarouselItem key={n} className="basis-1/2">
              <Card><CardHeader><CardTitle>Slide {n}</CardTitle><CardDescription>Swipe, drag or use the arrows.</CardDescription></CardHeader></Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}
