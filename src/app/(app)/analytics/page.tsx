import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { ScrollAnimation } from '@/components/scroll-animation';
import { ProblemChart } from '@/components/analytics/problem-chart';
import { SolutionChart } from '@/components/analytics/solution-chart';

export default function AnalyticsPage() {
  return (
    <PageTransitionWrapper className="container py-10">
      <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold font-headline">The REVO Impact</h1>
            <p className="text-lg text-muted-foreground mt-2">A clear comparison between the old linear model and the new circular economy.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12 items-start">
            <ScrollAnimation animation="fade-in-left">
                <ProblemChart />
            </ScrollAnimation>
            <ScrollAnimation animation="fade-in-right" delay={200}>
                <SolutionChart />
            </ScrollAnimation>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}
