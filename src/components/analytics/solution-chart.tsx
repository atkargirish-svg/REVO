'use client';

import { useState, useEffect } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getMonthlyWasteDiverted } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
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


export function SolutionChart() {
  const [chartData, setChartData] = useState<{ month: string; profit: number; pollutionSaved: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMonthlyWasteDiverted();
      // Assuming each diverted stream saves ~15 index points of pollution for visualization
      const solutionData = data.map(item => ({
        ...item,
        pollutionSaved: item.diverted * 15,
      }));
      setChartData(solutionData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full flex items-end px-4 gap-4">
                    <Skeleton className="h-[60%] w-1/6" />
                    <Skeleton className="h-[40%] w-1/6" />
                    <Skeleton className="h-[70%] w-1/6" />
                    <Skeleton className="h-[80%] w-1/6" />
                    <Skeleton className="h-[55%] w-1/6" />
                    <Skeleton className="h-[90%] w-1/6" />
                </div>
            </CardContent>
        </Card>
    )
  }
  
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
