'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getProducts();
      const featuredProducts = allProducts
        .filter(p => !p.isSold)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);
      setProducts(featuredProducts);
    };

    fetchProducts();
  }, []);


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
