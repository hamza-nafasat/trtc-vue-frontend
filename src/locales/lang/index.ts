// src/locales/index.ts
import { createI18n } from 'vue-i18n';
import en from './en';
import zh from './zh';

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('trtc-language') || 'en';

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLanguage, // Default language
  fallbackLocale: 'en', // Fallback language
  messages: {
    en,
    zh
  }
});

export default i18n;