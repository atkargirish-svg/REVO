'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { useTranslation } from '@/hooks/use-translation';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <PageTransitionWrapper>
      <Card className="mx-auto max-w-sm w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{t('login.title')}</CardTitle>
          <CardDescription>
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            {t('login.noAccount')}{' '}
            <Link href="/signup" className="underline text-primary hover:text-primary/80">
              {t('signup')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageTransitionWrapper>
  );
}
