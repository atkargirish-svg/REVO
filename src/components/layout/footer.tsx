
'use client';
import Link from 'next/link';
import SiteRating from './site-rating';


export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-16 pb-24">
      <div className="container flex flex-col items-center justify-center gap-6 py-8">
        <SiteRating />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
             <span className="text-muted-foreground/50">|</span>
             <Link href="/top-sellers" className="hover:text-primary transition-colors">Producers</Link>
             <span className="text-muted-foreground/50">|</span>
             <Link href="/analytics" className="hover:text-primary transition-colors">Our Impact</Link>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          © {new Date().getFullYear()} REVO. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
