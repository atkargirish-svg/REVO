'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function PageTransitionWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('opacity-0 animate-fade-in-up', className)}>
      {children}
    </div>
  );
}
