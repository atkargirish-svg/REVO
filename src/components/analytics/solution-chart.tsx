'use client';

import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowUpCircle } from 'lucide-react';

const chartConfig = {
  profit: {
    label: 'Profit Generated (₹)',
    color: 'hsl(142.1 76.2% 36.3%)', // Green
  },
  pollutionSaved: {
    label: 'Pollution Saved',
    color: 'hsl(var(--destructive))', // Red
  },
} satisfies ChartConfig;

const chartData = [
  { month: 'Jan', profit: 25000, pollutionSaved: 40 },
  { month: 'Feb', profit: 32000, pollutionSaved: 55 },
  { month: 'Mar', profit: 41000, pollutionSaved: 70 },
  { month: 'Apr', profit: 38000, pollutionSaved: 65 },
  { month: 'May', profit: 52000, pollutionSaved: 85 },
  { month: 'Jun', profit: 65000, pollutionSaved: 100 },
];

export function SolutionChart() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-6 w-6 text-primary" />
            <CardTitle className="text-primary">The Solution: Circular Economy with REVO</CardTitle>
        </div>
        <CardDescription>
          REVO transforms waste into value, generating profit for businesses and significantly reducing pollution.
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
                stroke="var(--color-pollutionSaved)"
                axisLine={false}
                tickLine={false}
                label={{ value: 'Pollution Saved', angle: -90, position: 'insideLeft', fill: 'var(--color-pollutionSaved)', offset: 10 }}
                />
                <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                axisLine={false}
                tickLine={false}
                stroke="var(--color-profit)"
                label={{ value: 'Profit Generated', angle: 90, position: 'insideRight', fill: 'var(--color-profit)', offset: 10 }}
                />
                <Tooltip
                cursor={false}
                content={<ChartTooltipContent 
                    indicator="line"
                    formatter={(value, name) => {
                        if (name === 'profit') {
                            return `₹${Number(value).toLocaleString()}`
                        }
                        return value;
                    }}
                />}
                />
                <Legend />
                <Line type="monotone" yAxisId="left" dataKey="pollutionSaved" stroke="var(--color-pollutionSaved)" strokeWidth={3} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={3} dot={false}/>
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
