'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const routes = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Marketplace' },
    { href: '/top-sellers', label: 'Producers' },
    ...(user ? [{ href: '/dashboard', label: 'My Waste' }] : []),
    { href: '/analytics', label: 'Analytics' },
    ...(user?.isAdmin ? [{ href: '/admin/dashboard', label: 'Admin Panel' }] : []),
  ];

  return (
    <nav className="hidden items-center space-x-4 md:flex lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            (route.href !== '/' && pathname.startsWith(route.href)) || pathname === route.href
              ? 'text-foreground'
              : 'text-foreground/60'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
