import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranslationContextType {
  targetLanguage: string;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Cache for translations to avoid redundant API calls
const translationCache = new Map<string, string>();

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language || navigator.languages?.[0] || 'es';
    const langCode = browserLang.split('-')[0]; // Get just the language code (e.g., 'en' from 'en-US')
    
    // If browser language is Spanish, no translation needed
    if (langCode === 'es') {
      setTargetLanguage('es');
    } else {
      // Map language codes to full language names for better translation
      const languageMap: { [key: string]: string } = {
        'en': 'English',
        'pt': 'Portuguese',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ko': 'Korean',
        'ru': 'Russian',
        'ar': 'Arabic',
      };
      
      setTargetLanguage(languageMap[langCode] || 'English');
    }
  }, []);

  const translate = async (text: string): Promise<string> => {
    // If target language is Spanish, return original text
    if (targetLanguage === 'es') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, targetLanguage }
      });

      if (error) throw error;

      const translatedText = data.translatedText || text;
      // Cache the translation
      translationCache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TranslationContext.Provider value={{ targetLanguage, translate, isTranslating }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};
