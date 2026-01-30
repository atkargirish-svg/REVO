'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition, useEffect } from 'react';
import { Loader2, Building2, MapPin, Instagram, Facebook, Phone, Upload, Mail } from 'lucide-react';
import type { User } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Separator } from '../ui/separator';
import { compressImage } from '@/lib/image-compressor';

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  company: z.string().min(3, 'Company name is required.'),
  phone: z.string().regex(/^(?:\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number.'),
  companyDescription: z.string().min(20, 'Company description must be at least 20 characters.'),
  location: z.string().min(5, 'Location is required.'),
  instagramUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  facebookUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  logo: z
    .any()
    .optional()
    .refine((files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_LOGO_SIZE, `Max logo size is 2MB.`)
    .refine(
        (files) => !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        ".jpg, .png and .webp files are accepted."
    ),
});

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { auth } = useAuth();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(user.avatar);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      company: user.company || '',
      phone: user.phone || '',
      companyDescription: user.companyDescription || '',
      location: user.location || '',
      instagramUrl: user.instagramUrl || '',
      facebookUrl: user.facebookUrl || '',
      logo: undefined,
    },
  });

  const logoFile = form.watch('logo');

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
        setPreview(user.avatar);
    }
  }, [logoFile, user.avatar]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth?.id) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    
    startTransition(async () => {
        try {
            const { logo, email, ...otherValues } = values;
            
            if (email !== user.email) {
                const { error: emailUpdateError } = await supabase.auth.updateUser({ email });
                if (emailUpdateError) {
                    throw new Error(`Email update failed: ${emailUpdateError.message}`);
                }
                toast({
                    title: 'Confirm your new email',
                    description: `A verification link has been sent to ${email}. Please check your inbox.`,
                });
            }

            let phone = otherValues.phone;
            if (phone && !phone.startsWith('+91')) {
                phone = '+91' + phone.replace(/^\+?91/, '');
            }

            const updatePayload: { [key: string]: any } = {
                display_name: otherValues.name,
                college: otherValues.company,
                phone_number: phone,
                company_description: otherValues.companyDescription,
                location: otherValues.location,
                instagram_url: otherValues.instagramUrl || null,
                facebook_url: otherValues.facebookUrl || null,
            };

            if (logo && logo.length > 0) {
                const logoFile = logo[0];
                const compressedFile = await compressImage(logoFile);
                const fileExt = compressedFile.name.split('.').pop();
                const fileName = `${auth.id}/${Date.now()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, compressedFile);

                if (uploadError) throw new Error(`Logo upload failed: ${uploadError.message}`);

                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                updatePayload.avatar = urlData.publicUrl;

                if (user.avatar) {
                    try {
                        const oldAvatarPath = user.avatar.split('/avatars/')[1];
                        if (oldAvatarPath) {
                            await supabase.storage.from('avatars').remove([oldAvatarPath]);
                        }
                    } catch (e) { console.error("Failed to delete old avatar", e); }
                }
            }

            const { error } = await supabase.from('profiles').update(updatePayload).eq('id', auth.id);

            if (error) throw error;

            toast({
                title: 'Profile Updated',
                description: 'Your information has been saved successfully.',
            });
            router.refresh();

        } catch (error: any) {
            toast({
                title: 'Update failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo</FormLabel>
              <FormControl>
                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 rounded-full border-4 border-muted overflow-hidden ring-2 ring-muted ring-offset-2 ring-offset-background">
                        {preview ? (
                            <Image src={preview} alt="Logo preview" fill className="object-cover" />
                        ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                                <Building2 className="h-10 w-10 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
                            <Upload className="h-4 w-4" />
                            <span>Upload Logo</span>
                        </div>
                        <Input id="logo-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => field.onChange(e.target.files)} />
                    </label>
                </div>
              </FormControl>
              <FormDescription>A square JPG, PNG, or WEBP. Max 2MB.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />
        <h3 className="text-lg font-medium">Business Details</h3>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Company Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description</FormLabel>
              <FormControl>
                 <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea placeholder="What does your company do?" className="pl-10" {...field} />
                 </div>
              </FormControl>
              <FormDescription>This will be displayed on your public profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Location</FormLabel>
              <FormControl>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., MIDC, Nagpur, Maharashtra" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormDescription>Your full company address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <h3 className="text-lg font-medium">Contact Information</h3>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Login Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="your.email@company.com" {...field} className="pl-10"/>
                </div>
              </FormControl>
              <FormDescription>
                This is your login email. A verification link will be sent if you change it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business WhatsApp</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="tel" placeholder="9876543210" {...field} className="pl-10"/>
                </div>
              </FormControl>
              <FormDescription>
                Used for business communication. No country code needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instagramUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram (Optional)</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="https://instagram.com/yourcompany" {...field} className="pl-10"/>
                 </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="facebookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="https://facebook.com/yourcompany" {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
