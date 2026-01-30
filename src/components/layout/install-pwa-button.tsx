'use client';

import { useState, useEffect } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function InstallPwaButton(props: ButtonProps) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  // The button is always rendered, but its functionality depends on the installPrompt.
  // This ensures a user who uninstalls can see the button again.
  return (
    <Button
      onClick={handleInstallClick}
      title="Install App"
      {...props}
    >
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
}
