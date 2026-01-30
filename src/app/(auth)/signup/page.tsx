'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignupForm } from '@/components/auth/signup-form';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';

export default function SignupPage() {
  return (
    <PageTransitionWrapper>
      <Card className="mx-auto max-w-sm w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create a Producer Account</CardTitle>
          <CardDescription>
            Join the circular economy. Create an account to start diverting waste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageTransitionWrapper>
  );
}
