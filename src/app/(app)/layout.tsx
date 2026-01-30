import type { ReactNode } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BottomNav from '@/components/layout/bottom-nav';
import ChatWidget from '@/components/chat/chat-widget';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-24">{children}</main>
      <Footer />
      <ChatWidget />
      <BottomNav />
    </div>
  );
}
