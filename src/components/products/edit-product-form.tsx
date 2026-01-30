'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getProductById, updateProduct } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { useData } from '@/context/data-context';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(3, 'Waste material type must be at least 3 characters.'),
  description: z.string().min(10, 'Composition/Condition must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.string({ required_error: 'Please select an industry sector.' }),
  whatsappNumber: z.string().regex(/^(?:\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number.'),
  image: z
    .any()
    .optional()
    .refine((files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
        (files) => !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});


type EditProductFormProps = {
  categories: string[];
  product: Product;
};

export default function EditProductForm({ categories, product }: EditProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { refetchData } = useData();
  const [preview, setPreview] = useState<string | null>(product.imageId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      category: product.category || '',
      whatsappNumber: product.whatsappNumber || '',
    },
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      const detailedProduct = await getProductById(product.id);
      if (detailedProduct?.whatsappNumber) {
        form.setValue('whatsappNumber', detailedProduct.whatsappNumber);
      }
    };
    fetchProductDetails();
  }, [product.id, form]);

  const imageFile = form.watch('image');

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
        setPreview(product.imageId);
    }
  }, [imageFile, product.imageId]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to update a waste stream.",
        });
        return;
    }
    
    let formattedWhatsappNumber = values.whatsappNumber;
    if (!formattedWhatsappNumber.startsWith('+91')) {
        formattedWhatsappNumber = '+91' + formattedWhatsappNumber.replace(/^\+?91/, '');
    }

    const submissionValues = {
        ...values,
        whatsappNumber: formattedWhatsappNumber,
    };

    startTransition(async () => {
      try {
        await updateProduct(product.id, submissionValues, user);
        toast({
          title: 'Waste Stream Updated!',
          description: `${values.name} has been successfully updated.`,
        });
        refetchData();
        router.push('/dashboard');
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to update stream",
          description: error.message || "An unexpected error occurred.",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waste Material Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., HDPE Pellets, Textile Sludge, Fly Ash" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry Sector</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select the source industry sector" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waste Material Image</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormDescription>Leave blank to keep current image. Max 5MB.</FormDescription>
              <FormMessage />
              {preview && (
                <div className="mt-4 relative w-full h-64 rounded-md overflow-hidden border">
                    <Image src={preview} alt="Product image preview" fill className="object-cover" />
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chemical Composition & Condition</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Contains 95% High-Density Polyethylene. Free of contaminants. Packaged in 1-ton jumbo bags."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Ton (₹)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="3500.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Contact (WhatsApp)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+919876543210" {...field} />
              </FormControl>
              <FormDescription>
                Buyers will use this number to connect. Use format: +91XXXXXXXXXX.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
