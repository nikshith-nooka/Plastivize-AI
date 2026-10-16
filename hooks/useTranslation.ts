
import React, { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useCallback((key: string, params: { [key: string]: string | number } = {}): string => {
    const langTranslations = translations[language] || translations.en;
    let text = langTranslations[key] || key;

    Object.keys(params).forEach(paramKey => {
      const regex = new RegExp(`{${paramKey}}`, 'g');
      text = text.replace(regex, String(params[paramKey]));
    });

    return text;
  }, [language]);

  return { t };
};
