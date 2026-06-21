// Supported languages. Arabic is primary (and RTL).
export const SUPPORTED_LANGUAGES = ['ar', 'fr', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'ar';
export const RTL_LANGUAGES: AppLanguage[] = ['ar'];

export const LANGUAGE_STORAGE_KEY = 'teyvay.language';

export const isRtlLanguage = (lang: string): boolean =>
  RTL_LANGUAGES.includes(lang as AppLanguage);

export const isSupportedLanguage = (lang: string): lang is AppLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
