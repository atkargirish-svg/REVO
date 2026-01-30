
import { getUsers, getProducts } from '@/lib/data';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import TopSellerCard from '@/components/user/top-seller-card';
import type { User } from '@/lib/types';
import { Trophy } from 'lucide-react';

// We create a new type that includes the product count
type UserWithProductCount = User & { productCount: number };

export default async function TopSellersPage() {
  const users = await getUsers();
  const products = await getProducts();

  const productCounts = new Map<string, number>();
  // We count all products, including sold ones, to represent total contribution
  products.forEach(product => {
    productCounts.set(product.sellerId, (productCounts.get(product.sellerId) || 0) + 1);
  });

  const usersWithCounts: UserWithProductCount[] = users.map(user => ({
    ...user,
    productCount: productCounts.get(user.id) || 0,
  }));

  const topSellers = usersWithCounts
    .filter(user => user.productCount > 0) // Only include users who have listed at least one product
    .sort((a, b) => b.productCount - a.productCount) // Sort by product count descending
    .slice(0, 10); // Get the top 10

  return (
    <PageTransitionWrapper className="container py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-headline">
          Top Waste Producers
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Highlighting the top 10 contributors to the circular economy on our platform based on the number of waste streams listed.
        </p>
      </div>

      {topSellers.length > 0 ? (
        <div className="max-w-3xl mx-auto space-y-4">
          {topSellers.map((seller, index) => (
            <TopSellerCard key={seller.id} seller={seller} rank={index + 1} productCount={seller.productCount} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No producers have listed any items yet. The leaderboard is waiting for its champions!</p>
        </div>
      )}
    </PageTransitionWrapper>
  );
}
