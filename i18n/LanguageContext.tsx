import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { availableLanguages } from './index';
import type { Language } from './index';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: any | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = (): Language => {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && availableLanguages.includes(storedLang)) {
      return storedLang;
    }
    const browserLang = navigator.language.split('-')[0] as Language;
    return availableLanguages.includes(browserLang) ? browserLang : 'en';
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTranslations = async (lang: Language) => {
        setIsLoading(true);
        try {
            const response = await fetch(`./i18n/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTranslations(data);
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
            if (lang !== 'en') {
                try {
                    const fallbackResponse = await fetch('./i18n/locales/en.json');
                    const fallbackData = await fallbackResponse.json();
                    setTranslations(fallbackData);
                } catch (fallbackError) {
                    console.error('Failed to load fallback English translations:', fallbackError);
                    setTranslations({});
                }
            } else {
                setTranslations({});
            }
        } finally {
            setIsLoading(false);
        }
    };
    fetchTranslations(language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, translations }), [language, translations]);

  // Only show a blank screen on the very first load, not on language change.
  // This prevents the app from unmounting and resetting state.
  if (isLoading && !translations) {
    return null;
  }

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