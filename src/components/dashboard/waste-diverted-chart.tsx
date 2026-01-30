'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getMonthlyWasteDiverted } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  diverted: {
    label: 'Waste Streams Diverted',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function WasteDivertedChart() {
  const [chartData, setChartData] = useState<{ month: string; diverted: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMonthlyWasteDiverted();
      setChartData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Waste Diverted from Landfill</CardTitle>
                <CardDescription>Fetching real-time platform data...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[220px] w-full flex items-end px-4 gap-4">
                    <Skeleton className="h-[80%] w-1/6" />
                    <Skeleton className="h-[50%] w-1/6" />
                    <Skeleton className="h-[90%] w-1/6" />
                    <Skeleton className="h-[60%] w-1/6" />
                    <Skeleton className="h-[75%] w-1/6" />
                    <Skeleton className="h-[40%] w-1/6" />
                </div>
            </CardContent>
        </Card>
    )
  }
  
  const totalDiverted = chartData.reduce((acc, item) => acc + item.diverted, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Waste Diverted from Landfill</CardTitle>
        <CardDescription>
            {totalDiverted > 0 
                ? `Based on ${totalDiverted} successful diversions on the platform in the last 6 months.`
                : "No waste diversions recorded in the last 6 months."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalDiverted > 0 ? (
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart 
                    data={chartData} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                    />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        allowDecimals={false}
                    />
                    <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                        content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="diverted" fill="var(--color-diverted)" radius={4} maxBarSize={30} />
                </BarChart>
            </ChartContainer>
        ) : (
            <div className="h-[220px] w-full flex items-center justify-center text-muted-foreground">
                <p>Start diverting waste to see your impact here!</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
