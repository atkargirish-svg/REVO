'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useData } from '@/context/data-context';

interface SimilarProductsProps {
  category: string;
  currentProductId: string;
}

export default function SimilarProducts({ category, currentProductId }: SimilarProductsProps) {
  const { products: allProducts, loading: isPending } = useData();
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
      const filteredProducts = allProducts
        .filter(p => 
          p.category === category && 
          p.id !== currentProductId && 
          !p.isSold
        )
        .slice(0, 4); // Limit to 4 similar products
      setSimilarProducts(filteredProducts);
  }, [allProducts, category, currentProductId]);

  if (isPending) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg overflow-hidden bg-card border">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full mt-2" />
                </div>
            </div>
        ))}
      </div>
    );
  }

  if (similarProducts.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No similar products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {similarProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
