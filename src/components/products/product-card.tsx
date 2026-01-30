import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import { ArrowRight, Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isUrl = product.imageId.startsWith('http');
  const image = isUrl ? null : PlaceHolderImages.find(img => img.id === product.imageId);
  const imageUrl = isUrl ? product.imageId : image?.imageUrl;

  // Consistent "random" score based on product ID
  const recyclabilityScore = (product.id.charCodeAt(product.id.length - 1) % 25) + 75;

  return (
    <Card asChild className={cn(
        "h-full flex flex-col group overflow-hidden rounded-lg border bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg",
        product.isSold && "opacity-60"
    )}>
        <Link href={`/products/${product.id}`}>
            <div className="relative aspect-video w-full overflow-hidden">
                {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={image?.imageHint || 'industrial waste'}
                />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                 {product.isSold && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <span className="border-2 border-destructive text-destructive font-bold text-lg rounded-md px-4 py-2">
                            DIVERTED
                        </span>
                    </div>
                )}
                 <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1 bg-primary/80 text-primary-foreground border-0">
                    <Recycle className="h-3 w-3" />
                    {recyclabilityScore}% Recyclable
                </Badge>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <h3 className="font-semibold text-lg truncate flex-grow group-hover:text-primary" title={product.name}>
                    {product.name}
                </h3>
                <p className="text-xl font-bold mt-1">₹{product.price.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">/ ton</span></p>
            </div>
            <div className="p-3 border-t">
                <Button size="sm" variant={product.isSold ? "secondary" : "default"} className="w-full" disabled={product.isSold}>
                    {product.isSold ? 'Stream Closed' : 'View Details'}
                    {!product.isSold && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </Link>
    </Card>
  );
}
