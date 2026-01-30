'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getProducts, getUsers } from '@/lib/data';
import type { Product, User } from '@/lib/types';
import { useAuth } from './auth-context';

interface DataContextType {
  products: Product[];
  users: User[];
  userProducts: Product[];
  loading: boolean;
  refetchData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [allProducts, allUsers] = await Promise.all([
            getProducts(),
            getUsers(),
        ]);
        const sortedProducts = allProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProducts(sortedProducts);
        setUsers(allUsers);
    } catch (error) {
        console.error("Failed to fetch data", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (!authLoading) {
      if (user && products.length > 0) {
        setUserProducts(products.filter(p => p.sellerId === user.id));
      } else {
        setUserProducts([]);
      }
    }
  }, [user, products, authLoading]);

  const value = { products, users, userProducts, loading, refetchData: fetchData };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
