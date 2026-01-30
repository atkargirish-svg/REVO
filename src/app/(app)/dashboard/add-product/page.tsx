import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import AddProductForm from '@/components/products/add-product-form';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddProductPage() {
  return (
    <PageTransitionWrapper className="container py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">List a New Waste Stream</CardTitle>
                <CardDescription>Fill out the details below to add a new industrial byproduct to the marketplace. Our AI can help write a description for you.</CardDescription>
            </CardHeader>
            <CardContent>
                <AddProductForm categories={PRODUCT_CATEGORIES} />
            </CardContent>
        </Card>
      </div>
    </PageTransitionWrapper>
  );
}
