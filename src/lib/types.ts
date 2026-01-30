export type User = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string | null;
  avatar: string | null;
  isAdmin: boolean;
  companyDescription: string | null;
  location: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageId: string; // id from placeholder images OR a full URL from Supabase
  sellerId: string;
  isSold: boolean;
  createdAt: Date;
  whatsappNumber?: string;
};
