'use client';

import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import CommunityRating from './community-rating';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import { ScrollAnimation } from '@/components/scroll-animation';

export default function AboutPage() {
  return (
    <PageTransitionWrapper className="container py-16 md:py-24">
      <div className="text-center max-w-3xl mx-auto">
        <Leaf className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
          About REVO
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Turning Industrial Waste into Raw Material through an AI-Powered Circular Economy Platform.
        </p>
      </div>

       <ScrollAnimation animation="fade-in-up" delay={100}>
        <div className="max-w-4xl mx-auto my-16 text-center">
          <h2 className="text-3xl font-bold font-headline mb-4">Our Mission</h2>
          <p className="text-muted-foreground sm:text-lg">
            We are building a trusted and efficient B2B marketplace to power the circular economy. Our mission is to connect industrial waste producers with recyclers and manufacturers, making it simple, fast, and secure to give industrial byproducts a second life. By leveraging AI, we aim to increase transparency, value, and sustainability in the industrial sector.
          </p>
        </div>
      </ScrollAnimation>

      <ScrollAnimation animation="zoom-in" delay={200}>
        <div className="max-w-md mx-auto my-12">
          <CommunityRating />
        </div>
      </ScrollAnimation>

    </PageTransitionWrapper>
  );
}
