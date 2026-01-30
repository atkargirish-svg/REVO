'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hi')} disabled={language === 'hi'}>
          हिन्दी
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
