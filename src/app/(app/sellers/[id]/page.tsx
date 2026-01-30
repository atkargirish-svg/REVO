import { getUserById, getProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import SellerPublicProfile from '@/components/user/seller-public-profile';
import ProductCard from '@/components/products/product-card';

export default async function SellerProfilePage({ params }: { params: { id: string } }) {
  const seller = await getUserById(params.id);
  
  if (!seller) {
    notFound();
  }
  
  const sellerProducts = (await getProducts({ sellerId: seller.id })).filter(p => !p.isSold);
  
  return (
    <PageTransitionWrapper className="container py-10">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <SellerPublicProfile seller={seller} />
        </div>
        <div className="lg:col-span-2 space-y-12">
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Items for Sale</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {sellerProducts.length > 0 ? (
                        sellerProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="text-muted-foreground col-span-full">This seller has no items for sale right now.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}
