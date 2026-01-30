'use client';
import Link from 'next/link';
import SiteRating from './site-rating';


export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-16 pb-24">
      <div className="container flex flex-col items-center justify-center gap-6 py-8">
        <SiteRating />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} REVO. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
