'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
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
import { Loader2, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { suggestDescription } from '@/ai/flows/suggest-description-flow';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addProduct } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { compressImage } from '@/lib/image-compressor';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
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
    .refine((files) => files?.length == 1, "Image of waste material is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

type AddProductFormProps = {
  categories: string[];
};


export default function AddProductForm({ categories }: AddProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { refetchData } = useData();
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      whatsappNumber: '',
      category: '',
    },
  });

  useEffect(() => {
    if (user?.phone) {
        let phone = user.phone;
        if (!phone.startsWith('+91')) {
            phone = '+91' + phone;
        }
        form.setValue('whatsappNumber', phone);
    }
  }, [user, form]);

  const imageFile = form.watch('image');
  const productName = form.watch('name');
  const productCategory = form.watch('category');

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(null);
  }, [imageFile]);


  const handleDescriptionSuggestion = useCallback(async () => {
    if (productName && productCategory && user?.company && user?.location) {
        setIsSuggestingDescription(true);
        try {
            const result = await suggestDescription({
                productName,
                category: productCategory,
                sellerCompany: user.company,
                sellerLocation: user.location,
            });
            if (result.suggestedDescription) {
                form.setValue('description', result.suggestedDescription, { shouldValidate: true });
                toast({ title: "Description Suggested!", description: "AI has generated a description for you." });
            } else {
                toast({ title: "Suggestion Failed", description: "The AI could not generate a description.", variant: 'destructive'});
            }
        } catch (error: any) {
            console.error('Description suggestion failed:', error);
            toast({ title: "Suggestion Failed", description: error.message || "Could not generate a description.", variant: 'destructive'});
        } finally {
            setIsSuggestingDescription(false);
        }
    }
  }, [productName, productCategory, user, form, toast]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to list a waste stream.",
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
        await addProduct(submissionValues, user);
        
        toast({
          title: 'Waste Stream Listed!',
          description: `Your ${values.name} stream is now on the marketplace.`,
        });
        refetchData();
        form.reset();
        setPreview(null);
        router.push('/dashboard');
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to list stream",
          description: error.message || "An unexpected error occurred.",
        });
      }
    });
  }
  
  const canSuggestDescription = productName && productCategory;
  const suggestionDisabled = !canSuggestDescription || isSuggestingDescription;
  
  const getTooltipText = () => {
      if (!productName && !productCategory) return "Enter material name and category to enable AI suggestion.";
      if (!productName) return "Please enter a material name first.";
      if (!productCategory) return "Please select an industry sector first.";
      return "";
  };

  const suggestDescriptionButton = (
    <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={handleDescriptionSuggestion}
        disabled={suggestionDisabled}
    >
        {isSuggestingDescription ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Sparkles className="mr-2 h-4 w-4" />
        )}
        AI Suggestion
    </Button>
  );

  if (!user?.companyDescription || !user?.location) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile Incomplete</AlertTitle>
            <AlertDescription>
                You must provide a company description and location before you can list a waste stream. Please update your profile.
            </AlertDescription>
            <Button asChild variant="link" className="p-0 h-auto mt-2 text-destructive">
                <Link href="/profile">
                    Go to Profile <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </Alert>
    )
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
              <FormDescription>Max 5MB. Clear image of the material.</FormDescription>
              <FormMessage />
              {preview && (
                <div className="mt-4 relative w-full h-64 rounded-md overflow-hidden border">
                    <Image src={preview} alt="Waste image preview" fill className="object-cover" />
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
                <div className="flex items-center justify-between">
                    <FormLabel>Chemical Composition & Condition</FormLabel>
                    <TooltipProvider>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <span tabIndex={suggestionDisabled ? 0 : -1}>
                                    {suggestDescriptionButton}
                                </span>
                            </TooltipTrigger>
                            {suggestionDisabled && !isSuggestingDescription && (
                                <TooltipContent>
                                    <p>{getTooltipText()}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
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
          List Waste Stream
        </Button>
      </form>
    </Form>
  );
}
