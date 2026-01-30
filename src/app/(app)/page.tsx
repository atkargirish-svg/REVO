'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import FeaturedProducts from '@/components/products/featured-products';
import { Factory, Recycle, Leaf, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProblemChart } from '@/components/analytics/problem-chart';
import { SolutionChart } from '@/components/analytics/solution-chart';
import Image from 'next/image';
import { ScrollAnimation } from '@/components/scroll-animation';
import { useTranslation } from '@/hooks/use-translation';

const StatCard = ({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

const IndustrialSymbiosisNetwork = () => {
    const { t } = useTranslation();
    return (
        <div className="w-full bg-card border rounded-lg p-6 overflow-hidden">
            <svg width="100%" viewBox="0 0 800 300" className="max-h-[350px]">
                {/* Lines */}
                <line x1="100" y1="150" x2="250" y2="100" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="100" y1="150" x2="250" y2="200" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="250" y1="100" x2="400" y2="150" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="250" y1="200" x2="400" y2="150" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="400" y1="150" x2="550" y2="100" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="400" y1="150" x2="550" y2="200" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="550" y1="100" x2="700" y2="150" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="550" y1="200" x2="700" y2="150" stroke="hsl(var(--border))" strokeWidth="1.5" />
                <line x1="250" y1="100" x2="550" y2="100" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4" />
                <line x1="250" y1="200" x2="550" y2="200" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4" />

                {/* Nodes */}
                <g className="animate-node-pulse">
                    <circle cx="100" cy="150" r="10" fill="hsl(var(--primary))" className="origin-center" />
                    <text x="100" y="185" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">{t('factoryA')}</text>
                </g>
                
                <g>
                    <circle cx="250" cy="100" r="9" fill="hsl(var(--secondary))" />
                    <text x="250" y="75" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">{t('recyclerX')}</text>
                </g>
                
                <g>
                    <circle cx="250" cy="200" r="9" fill="hsl(var(--secondary))" />
                    <text x="250" y="235" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">{t('manufacturerY')}</text>
                </g>

                <g className="animate-node-pulse" style={{ animationDelay: '0.5s' }}>
                    <circle cx="400" cy="150" r="10" fill="hsl(var(--primary))" className="origin-center"/>
                    <text x="400" y="185" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">{t('factoryB')}</text>
                </g>

                <g>
                    <circle cx="550" cy="100" r="9" fill="hsl(var(--secondary))" />
                    <text x="550" y="75" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">{t('cementPlant')}</text>
                </g>
                
                <g>
                    <circle cx="550" cy="200" r="9" fill="hsl(var(--secondary))" />
                    <text x="550" y="235" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">{t('textileUnit')}</text>
                </g>

                <g className="animate-node-pulse" style={{ animationDelay: '1s' }}>
                    <circle cx="700" cy="150" r="10" fill="hsl(var(--primary))" className="origin-center"/>
                    <text x="700" y="185" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">{t('factoryC')}</text>
                </g>
            </svg>
        </div>
    )
};


export default function HomePage() {
  const { t } = useTranslation();

  return (
    <PageTransitionWrapper>
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-center border-b overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/bg.jpg"
            alt="Hero background image"
            fill
            className="object-cover"
            priority
            data-ai-hint="background image"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative container px-4">
            <div className="mx-auto max-w-4xl flex flex-col items-center gap-6 animate-fade-in-up">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-headline text-white shadow-sm">
                    {t('home.hero.title')}
                </h1>
                <p className="max-w-2xl text-lg text-neutral-200 sm:text-xl">
                    {t('home.hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4 w-full sm:w-auto">
                    <Button asChild size="lg" variant="default">
                        <Link href="/products">{t('home.hero.explore')}</Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary">
                        <Link href="/dashboard/add-product">{t('home.hero.list')}</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="container py-10 md:py-16">
        <div className="space-y-12">
            {/* Live Impact Tracker */}
            <div>
                <ScrollAnimation animation="fade-in-up">
                    <h2 className="text-3xl font-bold font-headline mb-4">{t('home.impact.title')}</h2>
                </ScrollAnimation>
                <div className="grid gap-4 md:grid-cols-3">
                    <ScrollAnimation animation="zoom-in" delay={0}>
                        <StatCard 
                            title={t('home.impact.co2')}
                            value="12,450 kg"
                            description={t('home.impact.co2.desc')}
                            icon={<Leaf className="h-4 w-4 text-muted-foreground" />}
                        />
                    </ScrollAnimation>
                    <ScrollAnimation animation="zoom-in" delay={150}>
                        <StatCard 
                            title={t('home.impact.waste')}
                            value="890 Tons"
                            description={t('home.impact.waste.desc')}
                            icon={<Recycle className="h-4 w-4 text-muted-foreground" />}
                        />
                    </ScrollAnimation>
                    <ScrollAnimation animation="zoom-in" delay={300}>
                        <StatCard 
                            title={t('home.impact.transactions')}
                            value="1,200+"
                            description={t('home.impact.transactions.desc')}
                            icon={<Truck className="h-4 w-4 text-muted-foreground" />}
                        />
                    </ScrollAnimation>
                </div>
            </div>

            {/* REVO Impact Comparison */}
            <section id="revo-impact">
                <ScrollAnimation animation="fade-in-up">
                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-headline font-bold">
                            {t('home.revoImpact.title')}
                        </h2>
                        <p className="mt-2 max-w-2xl text-muted-foreground">
                            {t('home.revoImpact.subtitle')}
                        </p>
                    </div>
                </ScrollAnimation>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <ScrollAnimation animation="fade-in-left">
                        <ProblemChart />
                    </ScrollAnimation>
                    <ScrollAnimation animation="fade-in-right" delay={200}>
                        <SolutionChart />
                    </ScrollAnimation>
                </div>
            </section>

            {/* Industrial Symbiosis Network */}
            <ScrollAnimation animation="fade-in-up" delay={200}>
              <section id="symbiosis-network">
                <div className="text-left mb-8">
                  <h2 className="text-3xl font-headline font-bold">
                    {t('home.symbiosis.title')}
                  </h2>
                  <p className="mt-2 max-w-2xl text-muted-foreground">
                    {t('home.symbiosis.subtitle')}
                  </p>
                </div>
                <IndustrialSymbiosisNetwork />
              </section>
            </ScrollAnimation>

            {/* Featured Products Section */}
            <ScrollAnimation animation="fade-in-up">
              <section id="featured-products">
                  <div className="text-left mb-8">
                  <h2 className="text-3xl font-headline font-bold">
                      {t('home.featured.title')}
                  </h2>
                  <p className="mt-2 max-w-2xl text-muted-foreground">
                      {t('home.featured.subtitle')}
                  </p>
                  </div>
                  <FeaturedProducts />
                  <div className="mt-12 text-center">
                      <Button asChild variant="outline" size="lg">
                          <Link href="/products">{t('home.featured.viewAll')}</Link>
                      </Button>
                  </div>
              </section>
            </ScrollAnimation>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}
