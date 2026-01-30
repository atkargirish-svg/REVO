'use client';

import { useState } from 'react';
import type { Product } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

type SellerDashboardClientProps = {
  products: Product[];
  onProductDelete: (productId: string) => void;
  onStatusChange: (productId: string, isSold: boolean) => void;
};

export default function SellerDashboardClient({ products, onProductDelete, onStatusChange }: SellerDashboardClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        
        const { error } = await supabase
            .from('products')
            .delete()
            .match({ id: productToDelete.id });

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error deleting stream',
                description: error.message,
            });
        } else {
            toast({
                title: 'Waste Stream Deleted',
                description: `"${productToDelete.name}" has been removed.`,
            });
            onProductDelete(productToDelete.id);
            router.refresh();
        }
        setIsDeleting(false);
        setProductToDelete(null);
    }
  
    if (products.length === 0) {
        return (
            <div className="text-center py-16 border-dashed border-2 rounded-lg mt-8 bg-card">
                <h2 className="text-xl font-semibold">No waste streams listed!</h2>
                <p className="text-muted-foreground mt-2">Click "Add New Waste Stream" to get started.</p>
            </div>
        )
    }

    return (
        <>
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material Type</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Price (/ton)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{product.category}</Badge>
                            </TableCell>
                            <TableCell>₹{product.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={product.isSold ? "secondary" : "default"}>
                                    {product.isSold ? 'Diverted' : 'Available'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button
                                        aria-haspopup="true"
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/edit-product/${product.id}`}>Edit</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onStatusChange(product.id, !product.isSold)}>
                                        {product.isSold ? 'Mark as Available' : 'Mark as Diverted'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setProductToDelete(product)}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your listing for "{productToDelete?.name}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
