'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('revo_language') as Language;
    if (storedLanguage && ['en', 'hi'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('revo_language', lang);
  };

  const value = { language, setLanguage };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
