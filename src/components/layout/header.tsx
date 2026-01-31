import Link from 'next/link';
import UserNav from './user-nav';
import LanguageSwitcher from './language-switcher';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="/logo/logo.jpg" alt="REVO Logo" width={40} height={40} className="rounded-md" />
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSwitcher />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
