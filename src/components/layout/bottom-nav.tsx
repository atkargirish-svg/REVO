'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Home, ShoppingCart, MessageCircle, UserCircle, LayoutDashboard } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Shortened labels for better fit on mobile
  const loggedOutRoutes = [
    { href: '/', label: 'Home', icon: Home, active: pathname === '/' },
    { href: '/products', label: 'Market', icon: ShoppingCart, active: pathname.startsWith('/products') },
    { href: '/chat', label: 'Chat', icon: MessageCircle, active: pathname.startsWith('/chat') },
    { href: '/login', label: 'Login', icon: UserCircle, active: pathname === '/login' },
  ];

  const loggedInRoutes = [
    { href: '/', label: 'Home', icon: Home, active: pathname === '/' },
    { href: '/products', label: 'Market', icon: ShoppingCart, active: pathname.startsWith('/products') },
    { href: '/chat', label: 'Chat', icon: MessageCircle, active: pathname.startsWith('/chat') },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: pathname.startsWith('/dashboard') },
    { href: '/profile', label: 'Profile', icon: UserCircle, active: pathname === '/profile' },
  ].slice(0, 5);

  const routes = user ? loggedInRoutes : loggedOutRoutes;

  if (loading) {
    return (
        <div className="fixed bottom-4 inset-x-0 mx-auto w-auto h-16 bg-card/70 backdrop-blur-xl border z-50 rounded-full animate-pulse p-2">
           <div className="h-full min-w-[280px]"></div>
        </div>
    );
  }

  return (
    <div className="fixed bottom-4 inset-x-4 mx-auto w-auto max-w-sm h-16 bg-card/80 backdrop-blur-xl z-50 rounded-full border border-accent/30 shadow-[0_0_12px_hsl(var(--accent)/0.5)]">
      <nav className="h-full">
        <ul className="h-full flex items-center justify-around px-2">
          {routes.map((route) => (
            <li key={route.href} className="flex items-center justify-center">
              <Link
                href={route.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-16 h-14 text-xs font-medium transition-colors duration-200 rounded-full',
                  route.active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                 <route.icon className={cn("h-5 w-5 transition-transform duration-200", route.active && "scale-125")} />
                <span className={cn("truncate transition-opacity duration-200", route.active ? "opacity-100 font-bold" : "opacity-90")}>{route.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
