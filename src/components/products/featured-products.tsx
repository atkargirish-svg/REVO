import { getProducts } from '@/lib/data';
import ProductCard from './product-card';
import { cn } from '@/lib/utils';

export default async function FeaturedProducts() {
  const allProducts = await getProducts();
  // Show the 4 most recent, unsold products
  const featuredProducts = allProducts
    .filter(p => !p.isSold)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  if (featuredProducts.length === 0) {
    return (
        <div className="text-center mt-8 text-muted-foreground">
            No featured products available at the moment.
        </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {featuredProducts.map((product, index) => (
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
