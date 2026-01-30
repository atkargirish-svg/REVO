'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowDownCircle } from 'lucide-react';

const chartData = [
  { month: 'Jan', loss: 45000, pollution: 85 },
  { month: 'Feb', loss: 48000, pollution: 88 },
  { month: 'Mar', loss: 52000, pollution: 90 },
  { month: 'Apr', loss: 50000, pollution: 89 },
  { month: 'May', loss: 55000, pollution: 92 },
  { month: 'Jun', loss: 58000, pollution: 95 },
];

const chartConfig = {
  loss: {
    label: 'Financial Loss (₹)',
    color: 'hsl(var(--muted-foreground) / 0.5)',
  },
  pollution: {
    label: 'Pollution Index',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

export function ProblemChart() {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">The Problem: Linear Economy</CardTitle>
        </div>
        <CardDescription>
          Without a circular model, companies face significant financial losses from waste and contribute heavily to pollution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ComposedChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="hsl(var(--destructive))"
              tickFormatter={(value) => `${value}`}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Pollution Index', angle: -90, position: 'insideLeft', fill: 'hsl(var(--destructive))', offset: 10 }}
            />
             <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `₹${Number(value) / 1000}k`}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Financial Loss', angle: 90, position: 'insideRight', offset: 10 }}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="line"
                formatter={(value, name) => {
                    if (name === 'loss') {
                        return `₹${Number(value).toLocaleString()}`
                    }
                    return value;
                }}
              />}
            />
            <Legend />
            <Bar dataKey="loss" yAxisId="right" fill="var(--color-loss)" radius={4} maxBarSize={40} />
            <Line type="monotone" yAxisId="left" dataKey="pollution" stroke="var(--color-pollution)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
