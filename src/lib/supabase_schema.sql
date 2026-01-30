-- 1. PROFILES TABLE
-- Stores public user information.
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  college TEXT,
  phone_number TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'user',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'Links to the auth.users table.';


-- 2. PRODUCTS TABLE
-- Stores all product listings.
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    product_name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL CHECK (category IN ('Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Dorm Essentials', 'Bikes & Scooters', 'Other')),
    image_url TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    seller_name TEXT,
    whatsapp_number TEXT
);

COMMENT ON TABLE public.products IS 'Contains all product listings from users.';


-- 3. STORAGE BUCKET FOR PRODUCT IMAGES
-- Create a public bucket 'product_images' if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'product_images' bucket
-- Allow anyone to view images.
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product_images');

-- Allow authenticated users to upload images.
CREATE POLICY "Authenticated User Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product_images' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own images.
CREATE POLICY "Owner Update Access" ON storage.objects
FOR UPDATE USING (
  auth.uid() = owner
);

-- Allow users to delete their own images.
CREATE POLICY "Owner Delete Access" ON storage.objects
FOR DELETE USING (
  auth.uid() = owner
);


-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- RLS for 'profiles' table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view any profile.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
FOR SELECT USING (true);

-- Users can insert their own profile. (Handled by trigger function below)
-- Users can update their own profile.
CREATE POLICY "Users can update their own profile." ON public.profiles
FOR UPDATE USING (auth.uid() = id);


-- RLS for 'products' table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view all available products.
CREATE POLICY "Products are viewable by everyone." ON public.products
FOR SELECT USING (true);

-- Authenticated users can insert new products.
CREATE POLICY "Users can create new products." ON public.products
FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Users can update their own products.
CREATE POLICY "Users can update their own products." ON public.products
FOR UPDATE USING (auth.uid() = seller_id);

-- Users can delete their own products.
CREATE POLICY "Users can delete their own products." ON public.products
FOR DELETE USING (auth.uid() = seller_id);


-- 5. TRIGGER FUNCTION TO CREATE PROFILE ON SIGNUP
-- This function will automatically create a new row in public.profiles for a new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone_number, college, avatar)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'avatar'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that calls the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();