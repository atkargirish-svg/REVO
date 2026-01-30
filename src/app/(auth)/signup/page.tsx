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
import { useTranslation } from '@/hooks/use-translation';

export default function SignupPage() {
  const { t } = useTranslation();
  return (
    <PageTransitionWrapper>
      <Card className="mx-auto max-w-sm w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{t('signup.title')}</CardTitle>
          <CardDescription>
            {t('signup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            {t('signup.haveAccount')}{' '}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              {t('login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageTransitionWrapper>
  );
}
