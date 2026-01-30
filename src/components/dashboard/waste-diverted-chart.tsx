'use client';

import { useState, useEffect, Suspense } from 'react';
import { Bar, BarChart, Line, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getMonthlyWasteDiverted } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeImpact } from '@/ai/flows/analyze-impact-flow';
import { Bot } from 'lucide-react';

const chartConfig = {
  diverted: {
    label: 'Streams Diverted',
    color: 'hsl(var(--chart-1))',
  },
  profit: {
    label: 'Profit (₹)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

function AIReport({ data }: { data: any[] }) {
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    async function getReport() {
      if (data.length > 0) {
        const result = await analyzeImpact({ monthlyData: data });
        setReport(result.report);
      }
    }
    getReport();
  }, [data]);

  if (!report) {
    return <Skeleton className="h-4 w-3/4" />;
  }

  return (
    <p className="flex items-start gap-2 text-sm italic text-muted-foreground">
      <Bot className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{report}</span>
    </p>
  );
}


export function WasteDivertedChart() {
  const [chartData, setChartData] = useState<{ month: string; diverted: number; profit: number }[]>([]);
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
                <CardTitle>Monthly Impact Analysis</CardTitle>
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
        <CardTitle>Monthly Impact Analysis</CardTitle>
        <CardDescription>
            {totalDiverted > 0 
                ? <Suspense fallback={<Skeleton className="h-4 w-3/4" />}><AIReport data={chartData} /></Suspense>
                : "No waste diversions recorded in the last 6 months."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalDiverted > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ComposedChart 
                    data={chartData} 
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                    />
                    <YAxis 
                        yAxisId="left"
                        orientation="left"
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        allowDecimals={false}
                        label={{ value: 'Streams Diverted', angle: -90, position: 'insideLeft', offset: 10 }}
                    />
                     <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                        label={{ value: 'Profit Generated', angle: 90, position: 'insideRight', offset: 10 }}
                    />
                    <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                        content={<ChartTooltipContent 
                            formatter={(value, name) => {
                                if (name === 'profit') {
                                    return `₹${Number(value).toLocaleString()}`
                                }
                                return value;
                            }}
                        />}
                    />
                    <Bar yAxisId="left" dataKey="diverted" fill="var(--color-diverted)" radius={4} maxBarSize={30} />
                    <Line yAxisId="right" type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} dot={{r: 4, fill: "var(--color-profit)"}} activeDot={{r: 6}} />
                </ComposedChart>
            </ChartContainer>
        ) : (
             <div className="h-[250px] w-full flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/50 rounded-lg">
                <p className="font-semibold text-lg">No Data to Analyze</p>
                <p className="mt-1">Start diverting waste to see your financial and environmental impact here!</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
