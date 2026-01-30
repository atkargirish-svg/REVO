'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'zoom-in';

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

export function ScrollAnimation({
  children,
  className,
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.1,
  triggerOnce = false, // Default changed to `false` for repeated animations
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else {
          // Hide if not a one-time animation
          if (!triggerOnce) {
            setIsVisible(false);
          }
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref, threshold, triggerOnce]);

  const animationClasses = {
    'fade-in-up': 'animate-fade-in-up',
    'fade-in-left': 'animate-fade-in-left',
    'fade-in-right': 'animate-fade-in-right',
    'zoom-in': 'animate-zoom-in',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-opacity duration-500', // Added for smooth fade out
        isVisible ? animationClasses[animation] : 'opacity-0',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
