import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteDivertedChart } from '@/components/dashboard/waste-diverted-chart';
import { BarChart2 } from 'lucide-react';
import { ScrollAnimation } from '@/components/scroll-animation';

export default function AnalyticsPage() {
  return (
    <PageTransitionWrapper className="container py-10">
      <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold font-headline">Analytics Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2">Insights into your circular economy activities.</p>
        </div>
        
        <ScrollAnimation animation="fade-in-up">
            <WasteDivertedChart />
        </ScrollAnimation>

        <ScrollAnimation animation="zoom-in" delay={200}>
            <Card className="mt-8 text-center">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                        <BarChart2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">More Analytics Coming Soon</CardTitle>
                    <CardDescription>
                        We are building advanced analytics to provide deeper insights into cost savings, environmental impact, and supply chain efficiency.
                    </CardDescription>
                </CardHeader>
            </Card>
        </ScrollAnimation>
      </div>
    </PageTransitionWrapper>
  );
}
