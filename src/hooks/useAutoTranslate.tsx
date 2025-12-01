import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const useAutoTranslate = (originalText: string): string => {
  const { translate, targetLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(originalText);

  useEffect(() => {
    // If target language is Spanish, use original text
    if (targetLanguage === 'es') {
      setTranslatedText(originalText);
      return;
    }

    // Translate the text
    const doTranslate = async () => {
      const result = await translate(originalText);
      setTranslatedText(result);
    };

    doTranslate();
  }, [originalText, translate, targetLanguage]);

  return translatedText;
};
