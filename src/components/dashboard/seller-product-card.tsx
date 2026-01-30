
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface SellerProductCardProps {
  product: Product;
  onProductDelete: (productId: string) => void;
  onStatusChange: (productId: string, isSold: boolean) => void;
}

export function SellerProductCard({ product, onProductDelete, onStatusChange }: SellerProductCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        
        // First, delete from DB
        const { error } = await supabase
            .from('products')
            .delete()
            .match({ id: product.id });

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error deleting product',
                description: error.message,
            });
        } else {
            toast({
                title: 'Product Deleted',
                description: `"${product.name}" has been removed.`,
            });
            // Then, update UI state via parent
            onProductDelete(product.id);
            // Revalidate data for other pages
            router.refresh();
        }
        setIsDeleting(false);
        setShowDeleteDialog(false);
    }
  
    return (
    <>
        <Card className="overflow-hidden flex flex-col">
            <div className="relative aspect-video w-full overflow-hidden">
                <Image
                    src={product.imageId}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <CardContent className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg truncate pr-2" title={product.name}>
                        {product.name}
                    </h3>
                    <Badge variant="outline">{product.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <p className="text-xl font-bold mt-2">₹{product.price.toFixed(0)}</p>
            </CardContent>
            <CardFooter className="p-2 border-t flex gap-2">
                <Button 
                    variant={product.isSold ? 'secondary' : 'default'}
                    className="flex-grow"
                    onClick={() => onStatusChange(product.id, !product.isSold)}
                >
                    {product.isSold ? 'Mark as Available' : 'Mark as Sold'}
                </Button>
                <Button asChild variant="outline" size="icon">
                    <Link href={`/dashboard/edit-product/${product.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Link>
                </Button>
                 <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            </CardFooter>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your product listing for "{product.name}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    