'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ShieldCheck, Copy } from 'lucide-react';
import type { Product, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

// Simple hash function for demo purposes
const generateHash = (input: string) => {
  let hash = 0;
  if (input.length === 0) return '0x000...0000';
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Create a more realistic looking hash
  const pseudoRandom = Math.abs(hash * (input.charCodeAt(0) || 1)).toString(16);
  const fullHash = '0x' + (hash >>> 0).toString(16).padStart(8, '0') + pseudoRandom.padEnd(24, '0');
  return `${fullHash.substring(0, 6)}...${fullHash.substring(fullHash.length - 4)}`;
};

interface ProductCtaProps {
  product: Product;
  seller: User | undefined;
}

export default function ProductCta({ product, seller }: ProductCtaProps) {
  const { toast } = useToast();
  const [assetHash, setAssetHash] = useState('');

  useEffect(() => {
    // Generate hash on client to avoid hydration mismatch
    setAssetHash(generateHash(product.id));
  }, [product.id]);

  const whatsappMessage = `Hi, I'm interested in your waste material listing '${product.name}' on REVO.`;
  const whatsappUrl = seller && seller.phone ? `https://wa.me/${seller.phone.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}` : '#';

  const handleConnectClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (whatsappUrl === '#') {
        e.preventDefault();
        toast({
            variant: "destructive",
            title: "Could not connect",
            description: "Producer's contact information is not available.",
        });
        return;
    }
    
    e.preventDefault();
    toast({
      title: "🔗 Smart Contract Handshake Initiated",
      description: "Secure connection is being established on the ledger.",
    });
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 500);
  };
  
  const copyHash = () => {
    if (assetHash) {
      navigator.clipboard.writeText(assetHash);
      toast({
        title: "Hash Copied!",
        description: "Asset hash copied to clipboard.",
      });
    }
  }

  return (
    <>
      {product.isSold ? (
        <Button size="lg" className="w-full" disabled>
          This waste stream has been diverted
        </Button>
      ) : (
        <a href={whatsappUrl} onClick={handleConnectClick} className="block w-full">
           <Button size="lg" className="w-full">
            <MessageSquare className="mr-2 h-5 w-5" />
            Connect with Producer
          </Button>
        </a>
      )}

      {/* Blockchain Verification Section */}
      <Card className="border-green-500/30 bg-green-950/20 mt-6">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-6 w-6 text-green-400" />
                Blockchain Verification
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-3 rounded-md bg-background/50">
                <div className="overflow-hidden">
                    <p className="text-xs text-muted-foreground font-semibold">🛡️ ASSET HASH</p>
                    <p className="font-mono text-sm truncate" title={assetHash}>{assetHash || 'Generating...'}</p>
                </div>
                 <Button variant="ghost" size="icon" onClick={copyHash} title="Copy Hash">
                    <Copy className="h-4 w-4"/>
                    <span className="sr-only">Copy Hash</span>
                </Button>
            </div>
             <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground italic max-w-[70%]">This waste stream is cryptographically logged for supply chain transparency.</p>
                <Badge variant="outline" className="border-green-400 bg-green-950/60 text-green-300">Immutable Record</Badge>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
