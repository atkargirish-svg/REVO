'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as AppUser } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Session, User as AuthUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
  auth: AuthUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authUser: AuthUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setUser({
        id: profile.id,
        name: profile.display_name || 'New User',
        email: authUser.email || '',
        company: profile.college || 'Unnamed Company', // 'college' field from DB mapped to 'company'
        phone: profile.phone_number,
        avatar: profile.avatar || null,
        isAdmin: profile.role === 'admin',
        companyDescription: profile.company_description,
        location: profile.location,
        instagramUrl: profile.instagram_url,
        facebookUrl: profile.facebook_url,
      });
    } else {
        setUser(null);
    }
  }


  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        const currentAuthUser = session?.user ?? null;
        setAuthUser(currentAuthUser);

        if (currentAuthUser) {
          await fetchUserProfile(currentAuthUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Also check for initial session
    const getInitialSession = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const currentAuthUser = session?.user ?? null;
        setAuthUser(currentAuthUser);
        if (currentAuthUser) {
            await fetchUserProfile(currentAuthUser);
        }
        setLoading(false);
    }
    
    getInitialSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // The onAuthStateChange listener will handle setting the user state
    setLoading(false);
    return { error };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setAuthUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, auth: authUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
