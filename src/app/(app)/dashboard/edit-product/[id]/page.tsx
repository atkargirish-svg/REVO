'use client';

import { useState, useEffect, useTransition } from 'react';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import EditProductForm from '@/components/products/edit-product-form';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductById } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';

export default function EditProductPage({ params: { id } }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const fetchedProduct = await getProductById(id);
      setProduct(fetchedProduct);
    });
  }, [id]);

  if (isPending || product === undefined) {
    return (
        <PageTransitionWrapper className="container py-10">
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
      </PageTransitionWrapper>
    );
  }

  if (product === null) {
    notFound();
  }

  return (
    <PageTransitionWrapper className="container py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">Edit Waste Stream</CardTitle>
                <CardDescription>Update the details of your industrial byproduct listing.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditProductForm product={product} categories={PRODUCT_CATEGORIES} />
            </CardContent>
        </Card>
      </div>
    </PageTransitionWrapper>
  );
}
