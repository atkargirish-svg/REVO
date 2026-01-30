import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Instagram, Facebook, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

interface SellerPublicProfileProps {
  seller: User;
}

export default function SellerPublicProfile({ seller }: SellerPublicProfileProps) {
  const sellerAvatarUrl = seller.avatar;

  return (
    <Card className="sticky top-24">
      <CardHeader className="pt-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary/50">
          {sellerAvatarUrl && <AvatarImage src={sellerAvatarUrl} alt={seller.company} />}
          <AvatarFallback className="text-3xl">{seller.company.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline">{seller.company}</CardTitle>
        <CardDescription>Contact: {seller.name}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-4">
        {seller.companyDescription && (
            <div className="flex gap-4">
                <Building2 className="h-5 w-5 flex-shrink-0 mt-1" />
                <p>{seller.companyDescription}</p>
            </div>
        )}
        {seller.location && (
            <div className="flex gap-4">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-1" />
                <p>{seller.location}</p>
            </div>
        )}
        <div className="flex justify-center gap-4 pt-2">
            {seller.instagramUrl && (
                <Button asChild variant="ghost" size="icon">
                    <a href={seller.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </a>
                </Button>
            )}
            {seller.facebookUrl && (
                <Button asChild variant="ghost" size="icon">
                     <a href={seller.facebookUrl} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-5 w-5" />
                        <span className="sr-only">Facebook</span>
                    </a>
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
