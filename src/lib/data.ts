
import type { Product, User } from './types';
import { supabase } from './supabaseClient';
import { PlaceHolderImages } from './placeholder-images';
import { compressImage } from './image-compressor';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

// --- Products ---

export async function addProduct(productData: any, user: User) {
  const imageFile = productData.image[0];
  if (!imageFile) {
    throw new Error('Product image is missing.');
  }
  if (!user || !user.id || !user.name) {
    throw new Error('User data is incomplete. Please update your profile.');
  }

  // Failsafe: Ensure WhatsApp number is correctly formatted with +91
  let formattedWhatsappNumber = productData.whatsappNumber;
  if (!formattedWhatsappNumber.startsWith('+91')) {
      formattedWhatsappNumber = '+91' + formattedWhatsappNumber.replace(/^\+?91/, '');
  }
  
  // 1. Compress image
  const compressedFile = await compressImage(imageFile);

  // 2. Upload image to Supabase Storage
  const fileExt = compressedFile.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from('product_images')
    .upload(fileName, compressedFile);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  // 3. Get public URL of the uploaded image
  const { data: urlData } = supabase.storage
    .from('product_images')
    .getPublicUrl(fileName);

  if (!urlData) {
      throw new Error('Could not get public URL for the uploaded image.');
  }
  const imageUrl = urlData.publicUrl;

  // 4. Insert product data into the 'products' table
  const { error: insertError } = await supabase.from('products').insert({
    seller_id: user.id,
    product_name: productData.name,
    description: productData.description,
    price: productData.price,
    category: productData.category,
    image_url: imageUrl,
    seller_name: user.name, // Denormalizing for easier access, can be removed if needed
    whatsapp_number: formattedWhatsappNumber,
  });

  if (insertError) {
    console.error('Error inserting product:', insertError);
    // Attempt to delete the orphaned image if the product insertion fails
    await supabase.storage.from('product_images').remove([fileName]);
    throw new Error(`Failed to save product: ${insertError.message}`);
  }

  return { ...productData, image_url: imageUrl };
}

export async function updateProduct(productId: string, productData: any, user: User) {
    if (!user || !user.id) {
        throw new Error('User data is incomplete. Please log in again.');
    }
    
    // Failsafe: Ensure WhatsApp number is correctly formatted with +91
    let formattedWhatsappNumber = productData.whatsappNumber;
    if (formattedWhatsappNumber && !formattedWhatsappNumber.startsWith('+91')) {
        formattedWhatsappNumber = '+91' + formattedWhatsappNumber.replace(/^\+?91/, '');
    }

    const oldProduct = await getProductById(productId);
    if (!oldProduct) {
      throw new Error("Product not found");
    }

    let imageUrl = oldProduct.imageId; 

    // Check if a new image is being uploaded
    if (productData.image && productData.image.length > 0) {
        const imageFile = productData.image[0];
        
        // 1. Compress the new image
        const compressedFile = await compressImage(imageFile);

        // 2. Upload new image
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(fileName, compressedFile);

        if (uploadError) {
            console.error('Error uploading new image:', uploadError);
            throw new Error(`New image upload failed: ${uploadError.message}`);
        }

        // 3. Get new public URL
        const { data: urlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
        if (!urlData) {
            throw new Error('Could not get public URL for the new image.');
        }
        imageUrl = urlData.publicUrl;

        // Optionally: Delete old image from storage if it's not a placeholder
        if (oldProduct.imageId.includes('supabase.co')) {
            const oldFilePath = oldProduct.imageId.substring(oldProduct.imageId.indexOf(user.id));
            if(oldFilePath) {
                // We can ignore the error if old file deletion fails
                await supabase.storage.from('product_images').remove([oldFilePath]);
            }
        }
    }

    // 4. Update product data in the 'products' table
    const { error: updateError } = await supabase
        .from('products')
        .update({
            product_name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            whatsapp_number: formattedWhatsappNumber,
            image_url: imageUrl, // Use new or existing image URL
        })
        .eq('id', productId)
        .eq('seller_id', user.id); // Ensure only the owner can update

    if (updateError) {
        console.error('Error updating product:', updateError);
        throw new Error(`Failed to update product: ${updateError.message}`);
    }

    return { ...productData, image_url: imageUrl };
}

export async function updateProductStatus(productId: string, status: 'available' | 'sold') {
    const { error } = await supabase
        .from('products')
        .update({ status: status })
        .eq('id', productId);

    if (error) {
        console.error('Error updating product status:', error);
        throw new Error(`Failed to update product status: ${error.message}`);
    }
}


export async function getProducts(options: { sellerId?: string } = {}): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*');
    
    if (options.sellerId) {
      query = query.eq('seller_id', options.sellerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.product_name,
      description: p.description,
      price: p.price,
      category: p.category,
      imageId: p.image_url || 'product-textbook', 
      sellerId: p.seller_id,
      isSold: p.status === 'sold',
      createdAt: new Date(p.created_at),
      whatsappNumber: p.whatsapp_number,
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      // console.error('Error fetching product by id:', error); // Hide console error for not found
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.product_name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageId: data.image_url || 'product-textbook',
      sellerId: data.seller_id,
      isSold: data.status === 'sold',
      createdAt: new Date(data.created_at),
      whatsappNumber: data.whatsapp_number,
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

// --- Users ---

const toUser = (profile: any): User => ({
  id: profile.id,
  name: profile.display_name || 'Unknown User',
  email: profile.email || '',
  company: profile.college || 'Some Company',
  phone: profile.phone_number,
  avatar: profile.avatar || null,
  isAdmin: profile.role === 'admin',
  companyDescription: profile.company_description,
  location: profile.location,
  instagramUrl: profile.instagram_url,
  facebookUrl: profile.facebook_url,
});

export async function getUsers(): Promise<User[]> {
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data.map(toUser);
    } catch(e) {
        console.error(e);
        return [];
    }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle(); 
    
    if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        return undefined;
    }

    if (!profileData) {
        return undefined;
    }

    return toUser(profileData);

  } catch(e) {
    console.error(e);
    return undefined;
  }
}

// --- Reviews ---
export async function getReviewerById(id: string): Promise<{ name: string; avatar: string; } | undefined> {
    const user = await getUserById(id);
    if (!user || !user.avatar) return undefined;
    return { name: user.name, avatar: user.avatar };
}

// --- Community Ratings ---

export async function getCommunityRating(): Promise<{ average: number, count: number }> {
    const { data, error, count } = await supabase.from('community_ratings').select('rating', { count: 'exact' });

    if (error) {
        console.error("Error fetching community rating:", error);
        return { average: 0, count: 0 };
    }

    if (!data || data.length === 0) {
        return { average: 0, count: 0 };
    }

    const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
    const average = totalRating / data.length;

    return { average, count: count || 0 };
}

export async function addCommunityRating(rating: number, userId: string) {
    // Check if user has already rated
    const { data: existingRating, error: fetchError } = await supabase
        .from('community_ratings')
        .select('id')
        .eq('user_id', userId)
        .single();

    if(fetchError && fetchError.code !== 'PGRST116') { // PGRST116: "exact-single-row" error, which is fine if no row exists
        throw new Error(fetchError.message);
    }

    if (existingRating) {
        // Update existing rating
        const { error } = await supabase
            .from('community_ratings')
            .update({ rating, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        if (error) throw new Error(error.message);
    } else {
        // Insert new rating
        const { error } = await supabase
            .from('community_ratings')
            .insert({ rating, user_id: userId });
        if (error) throw new Error(error.message);
    }
}

export async function getMonthlyWasteDiverted(): Promise<{ month: string; diverted: number; profit: number }[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await supabase
        .from('products')
        .select('created_at, price')
        .eq('status', 'sold')
        .gte('created_at', sixMonthsAgo.toISOString());

    if (error) {
        console.error('Error fetching monthly waste data:', error);
        return [];
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize data for the last 6 months
    const monthlyData: { [key: string]: { month: string; diverted: number; profit: number } } = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = monthNames[d.getMonth()];
        monthlyData[monthName] = { month: monthName, diverted: 0, profit: 0 };
    }

    data.forEach(item => {
        const date = new Date(item.created_at);
        const monthName = monthNames[date.getMonth()];
        if (monthlyData[monthName]) {
            monthlyData[monthName].diverted += 1;
            monthlyData[monthName].profit += item.price;
        }
    });
    
    return Object.values(monthlyData);
}
