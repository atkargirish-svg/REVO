
'use client';

import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';
import type { TranslationKey } from '@/lib/translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let translation = translations[key]?.[language] || key;
    if (params) {
        Object.keys(params).forEach(paramKey => {
            translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
        });
    }
    return translation;
  };

  return { t, language };
};
