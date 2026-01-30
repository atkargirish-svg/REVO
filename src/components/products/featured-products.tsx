'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useData } from '@/context/data-context';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { products: allProducts } = useData();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const featuredProducts = allProducts
      .filter(p => !p.isSold)
      .slice(0, 4);
    setProducts(featuredProducts);
  }, [allProducts]);


  if (products.length === 0) {
    return (
        <div className="text-center mt-8 text-muted-foreground">
            {t('featured.none')}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className={cn(
            "animate-fade-in-up",
            (index === 1 || index === 3) && "md:mt-8"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
