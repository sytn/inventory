import React, { createContext, useState, useContext } from 'react';
import trTranslations from '../locales/tr.json';

// For now we'll only use Turkish, but structure allows for multiple languages
const translations = {
  tr: trTranslations
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr');

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Replace parameters in the translation
    if (value && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};