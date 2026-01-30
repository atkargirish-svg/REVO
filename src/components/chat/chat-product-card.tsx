'use client';

import type { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ChatProductCard({ product }: { product: Product }) {
  const isUrl = product.imageId.startsWith('http');
  const image = isUrl ? null : PlaceHolderImages.find(img => img.id === product.imageId);
  const imageUrl = isUrl ? product.imageId : image?.imageUrl;

  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-background hover:bg-muted/50 transition-colors rounded-lg w-40 flex-shrink-0 border hover:border-primary/50"
    >
      <div className="flex flex-col h-full">
        {imageUrl && (
          <div className="relative h-16 w-full flex-shrink-0 overflow-hidden rounded-t-md">
            <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0 p-2 flex flex-col justify-between">
          <p className="font-semibold truncate text-sm leading-tight">{product.name}</p>
          <p className="text-xs font-bold text-primary mt-1">
            ₹{product.price.toFixed(0)} <span className="font-normal text-muted-foreground">/ ton</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
