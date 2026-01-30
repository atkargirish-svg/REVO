-- supabase_schema.sql

-- 1. Create Profiles Table
-- This table stores public-facing user infCREATE TE TABLE
  public.profiles (
    id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE,
    display_name TEXT,
    college TEXT,
    phone_number TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
  );

-- Comments for profiles table
COMMENT ON TABLE public.profiles IS 'Stores public user profile information.';
COMMENT ON COLUMN public.profiles.id IS 'References the user in auth.users.';
COMMENT ON COLUMN public.profiles.role IS 'User role, e.g., ''user'' or ''admin''.';


-- 2. Create Products Table
-- This table stores information about products listed for sale.
CREATE TABLE
  public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid (),
    seller_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT,
    image_url TEXT,
    whatsapp_number TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
  );

-- Comments for products table
COMMENT ON TABLE public.products IS 'Stores products listed for sale on the marketplace.';
COMMENT ON COLUMN public.products.status IS 'The current status of the product, e.g., ''available'', ''sold''.';

-- 3. Create Storage Bucket for Product Images
-- This sets up the storage for user-uploaded product photos.
INSERT INTO
  storage.buckets (id, name, public)
VALUES
  ('product_images', 'product_images', TRUE) ON CONFLICT (id) DO NOTHING;

-- Comments for storage bucket
COMMENT ON BUCKET product_images IS 'Stores images for product listings.';


-- 4. Set up Row Level Security (RLS)

-- Enable RLS for profiles and products
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles Table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT
WITH
  CHECK (auth.uid () = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR
UPDATE
  USING (auth.uid () = id)
WITH
  CHECK (auth.uid () = id);

-- Policies for Products Table
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR
SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own products." ON public.products;
CREATE POLICY "Users can insert their own products." ON public.products FOR INSERT
WITH
  CHECK (auth.uid () = seller_id);

DROP POLICY IF EXISTS "Users can update their own products." ON public.products;
CREATE POLICY "Users can update their own products." ON public.products FOR
UPDATE
  USING (auth.uid () = seller_id)
WITH
  CHECK (auth.uid () = seller_id);

DROP POLICY IF EXISTS "Users can delete their own products." ON public.products;
CREATE POLICY "Users can delete their own products." ON public.products FOR DELETE USING (auth.uid () = seller_id);

-- Policies for Storage (product_images bucket)
DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;
CREATE POLICY "Allow public read access to product images" ON storage.objects FOR
SELECT
  USING (bucket_id = 'product_images');

DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects FOR INSERT
WITH
  CHECK (
    bucket_id = 'product_images'
    AND auth.role () = 'authenticated'
  );

DROP POLICY IF EXISTS "Allow owner to update their product images" ON storage.objects;
CREATE POLICY "Allow owner to update their product images" ON storage.objects FOR
UPDATE
  USING (
    auth.uid () = owner
    AND bucket_id = 'product_images'
  )
WITH
  CHECK (auth.uid () = owner);

DROP POLICY IF EXISTS "Allow owner to delete their product images" ON storage.objects;
CREATE POLICY "Allow owner to delete their product images" ON storage.objects FOR DELETE USING (
  auth.uid () = owner
  AND bucket_id = 'product_images'
);


-- 5. Create Trigger Function to Automatically Create a Profile on User Signup

-- Function to create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, college, phone_number, avatar)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'avatar'
  );
  RETURN new;
END;
$$;

-- Trigger to call the function after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Set the function owner to the postgres role
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
