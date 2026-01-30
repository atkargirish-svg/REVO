
import { getProductById, getUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import type { Product, User } from '@/lib/types';
import SimilarProducts from '@/components/products/similar-products';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M16.75 13.96c.25.13.43.2.5.28.08.09.16.21.23.34.07.13.1.28.1.44 0 .2-.06.38-.18.53s-.29.27-.49.34c-.2.07-.44.11-.7.11-.25 0-.5-.04-.76-.11-.68-.21-1.33-.5-1.94-.86-.6-.37-1.16-.8-1.67-1.3-.51-.5-.95-1.07-1.3-1.68-.34-.61-.58-1.29-.7-2.03.04-.15.09-.28.15-.4.1-.18.23-.34.39-.47.16-.13.33-.2.5-.22.08 0 .16-.01.24-.01.08,0,.16.01.24.01.15.01.28.05.39.11.12.06.2.14.24.24.04.1.06.2.06.31 0 .08-.01.16-.04.24-.03.08-.06.16-.1.24-.04.08-.07.15-.1.21-.03.06-.05.11-.05.15 0 .04.01.08.04.12.16.32.38.62.65.88.27.27.57.48.88.66.04.03.08.04.12.04.04 0 .09-.02.15-.05.06-.03.13-.07.21-.1.08-.04.16-.07.24-.1.08-.03.16-.04.24-.04.12 0 .23.02.32.06.1.04.18.1.24.18zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18.5a8.5 8.5 0 1 1 8.5-8.5 8.51 8.51 0 0 1-8.5 8.5z" />
    </svg>
  );

export default async function ProductDetailPage({ params: { id } }: { params: { id: string } }) {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }
  
  const seller = await getUserById(product.sellerId);

  const isUrl = product.imageId.startsWith('http');
  const image = isUrl ? null : PlaceHolderImages.find(img => img.id === product.imageId);
  const imageUrl = isUrl ? product.imageId : image?.imageUrl;

  const sellerAvatar = seller ? PlaceHolderImages.find(img => img.id === seller.avatar) : null;

  const whatsappMessage = `Hi, I'm interested in your product '${product.name}' on Suryodaya Bazar.`;
  const whatsappUrl = seller ? `https://wa.me/${seller.phone.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}` : '#';


  return (
    <PageTransitionWrapper className="container py-10">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square md:aspect-auto md:h-full w-full max-h-[500px] rounded-lg overflow-hidden border">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              data-ai-hint={image?.imageHint || 'product image'}
            />
          ) : <div className="bg-muted w-full h-full flex items-center justify-center text-muted-foreground">Image not available</div>}
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
          </div>
          
          <p className="text-muted-foreground text-lg">{product.description}</p>
          
          {product.isSold ? (
            <Button size="lg" className="w-full" disabled>
              This item has been sold
            </Button>
          ) : (
            <Button asChild size="lg" className="w-full">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-6 w-6" />
                Buy on WhatsApp
              </a>
            </Button>
          )}

          {seller && (
            <Card>
              <CardHeader>
                <CardTitle>About the Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/sellers/${seller.id}`} className="flex items-center gap-4 group">
                  <Avatar>
                    {sellerAvatar && <AvatarImage src={sellerAvatar.imageUrl} alt={seller.name} data-ai-hint={sellerAvatar.imageHint || 'seller avatar'}/>}
                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold group-hover:text-primary transition-colors">{seller.name}</p>
                    <p className="text-sm text-muted-foreground">{seller.college}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="mt-16">
        <h2 className="text-3xl font-bold font-headline mb-6">Similar Products</h2>
        <SimilarProducts category={product.category} currentProductId={product.id} />
      </div>
    </PageTransitionWrapper>
  );
}
