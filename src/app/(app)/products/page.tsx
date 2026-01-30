'use client';

import { useState, useEffect } from 'react';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import ProductCard from '@/components/products/product-card';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollAnimation } from '@/components/scroll-animation';
import { useData } from '@/context/data-context';

export default function AllProductsPage() {
  const { products, loading: isPending } = useData();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let tempProducts = [...products];

    if (category !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === category);
    }

    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(tempProducts);
  }, [searchTerm, category, products]);

  return (
    <PageTransitionWrapper className="container py-10">
      <div className="flex flex-col gap-6 mb-8">
        <div className='text-center'>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-headline">Waste Exchange Marketplace</h1>
            <p className="mt-2 text-lg text-muted-foreground">Discover high-value industrial byproducts and raw materials.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 sticky top-[65px] bg-background/80 pt-4 pb-4 z-10 backdrop-blur-sm -mx-4 px-4 border-y">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search for Plastic, Textile, E-waste..."
                className="pl-10 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[280px] h-11">
                <SelectValue placeholder="Filter by Industry Sector" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {PRODUCT_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>


      {isPending ? (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg overflow-hidden bg-card border">
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-9 w-full mt-2" />
                    </div>
                </div>
            ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product, index) => (
            <ScrollAnimation key={product.id} animation="zoom-in" delay={index * 50}>
                <ProductCard product={product} />
            </ScrollAnimation>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No waste streams found matching your criteria.</p>
        </div>
      )}
    </PageTransitionWrapper>
  );
}
