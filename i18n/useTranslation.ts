import { useCallback } from 'react';
import { useLanguage } from './LanguageContext';

// A simple interpolation function
const interpolate = (str: string, params: Record<string, string | number>): string => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, str);
};

export const useTranslation = () => {
  const { language, translations } = useLanguage();

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    if (!translations) {
      return key; // Should not happen due to loading state in provider
    }

    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        console.warn(`Translation key not found: "${key}" in language "${language}"`);
        return key;
      }
    }
    
    if (typeof result === 'string' && params) {
      return interpolate(result, params);
    }

    return String(result) || key;
  }, [language, translations]);
  
  const getMissions = useCallback((): string[] => {
    if (!translations) {
        return []; // Should not happen
    }
    return translations.missions || [];
  }, [translations]);

  return { t, getMissions, language };
};