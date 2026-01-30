import { getProductById, getUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import SimilarProducts from '@/components/products/similar-products';
import { ArrowRight } from 'lucide-react';
import { Suspense } from 'react';
import { AIAppraisal } from '@/components/products/ai-appraisal';
import { AIAppraisalSkeleton } from '@/components/products/ai-appraisal-skeleton';
import { ScrollAnimation } from '@/components/scroll-animation';
import ProductCta from '@/components/products/product-cta';


export default async function ProductDetailPage({ params: { id } }: { params: { id: string } }) {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }
  
  const seller = await getUserById(product.sellerId);

  const isUrl = product.imageId.startsWith('http');
  const image = isUrl ? null : PlaceHolderImages.find(img => img.id === product.imageId);
  const imageUrl = isUrl ? product.imageId : image?.imageUrl;

  const sellerAvatarUrl = seller?.avatar;
  
  return (
    <PageTransitionWrapper className="container py-10">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ScrollAnimation animation="fade-in-left">
            <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                {imageUrl ? (
                    <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image?.imageHint || 'industrial waste'}
                    />
                ) : <div className="bg-muted w-full h-full flex items-center justify-center text-muted-foreground">Image not available</div>}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Chemical Composition & Condition</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{product.description}</p>
                    </CardContent>
                </Card>
            </div>
        </ScrollAnimation>
        <ScrollAnimation animation="fade-in-right" delay={100}>
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <Badge variant="outline">{product.category}</Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
                    <p className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">/ ton</span></p>
                </div>
            
                <ProductCta product={product} seller={seller} />

                {seller && (
                    <Card>
                    <CardHeader>
                        <CardTitle>Waste Producer Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/sellers/${seller.id}`} className="flex items-center gap-4 group">
                        <Avatar>
                            {sellerAvatarUrl && <AvatarImage src={sellerAvatarUrl} alt={seller.company} />}
                            <AvatarFallback>{seller.company.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold group-hover:text-primary transition-colors">{seller.company}</p>
                            <p className="text-sm text-muted-foreground">{seller.name}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </CardContent>
                    </Card>
                )}
                
                {!product.isSold && (
                    <Suspense fallback={<AIAppraisalSkeleton />}>
                        {/* @ts-ignore */}
                        <AIAppraisal product={product} />
                    </Suspense>
                )}
            </div>
        </ScrollAnimation>
      </div>
      <div className="mt-16">
        <ScrollAnimation animation="fade-in-up">
          <h2 className="text-3xl font-bold font-headline mb-6">Similar Waste Streams</h2>
          <SimilarProducts category={product.category} currentProductId={product.id} />
        </ScrollAnimation>
      </div>
    </PageTransitionWrapper>
  );
}
