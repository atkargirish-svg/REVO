'use client';

import type { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ChatProductCard({ product }: { product: Product }) {
  const isUrl = product.imageId.startsWith('http');
  const image = isUrl ? null : PlaceHolderImages.find(img => img.id === product.imageId);
  const imageUrl = isUrl ? product.imageId : image?.imageUrl;

  return (
    <Link href={`/products/${product.id}`} className="mt-2 block bg-background/50 hover:bg-background/80 transition-colors rounded-b-lg">
      <div className="flex items-center gap-3 p-2">
        {imageUrl && (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
            <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{product.name}</p>
          <p className="text-sm font-bold text-primary">₹{product.price.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">/ ton</span></p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  );
}
