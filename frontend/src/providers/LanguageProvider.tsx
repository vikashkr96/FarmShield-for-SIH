'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, translations, languagesList, getTranslationValue } from '../translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'farmshield_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default language is English ('en') or Hindi ('hi')
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LOCAL_STORAGE_KEY) as SupportedLanguage;
      if (savedLang && languagesList.some((l) => l.code === savedLang)) {
        setLanguageState(savedLang);
      }
    } catch {
      // Ignore
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const t = (key: string): string => {
    const currentDict = translations[language] || translations['en'];
    const translated = getTranslationValue(currentDict as unknown as Record<string, unknown>, key);
    if (translated === key) {
      // Fallback to English if translation key missing
      return getTranslationValue(translations['en'] as unknown as Record<string, unknown>, key);
    }
    return translated;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div data-lang={language} className={isInitialized ? '' : 'opacity-95'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
