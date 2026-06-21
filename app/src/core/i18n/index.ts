import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isRtlLanguage,
  isSupportedLanguage,
} from './config';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

// Core resources live under the default 'core' namespace. Feature modules add
// their own namespaces at runtime via i18n.addResourceBundle(...).
export const CORE_NS = 'core';

async function resolveInitialLanguage(): Promise<AppLanguage> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && isSupportedLanguage(stored)) return stored;

  const device = Localization.getLocales()[0]?.languageCode ?? '';
  if (isSupportedLanguage(device)) return device;

  return DEFAULT_LANGUAGE;
}

export async function initI18n(): Promise<typeof i18n> {
  const lng = await resolveInitialLanguage();

  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: CORE_NS,
    ns: [CORE_NS],
    resources: {
      ar: { [CORE_NS]: ar },
      fr: { [CORE_NS]: fr },
      en: { [CORE_NS]: en },
    },
    interpolation: { escapeValue: false },
  });

  return i18n;
}

// Reactive RTL flag for the current language. Re-renders consumers on change.
// We drive layout direction in JS (via the `direction` style) rather than
// I18nManager.forceRTL, which requires a native restart and is unreliable in
// Expo Go.
export function useIsRTL(): boolean {
  const { i18n: instance } = useTranslation();
  return isRtlLanguage(instance.language);
}

// Has the user explicitly chosen a language? (false on very first launch).
// Presence of the stored key means the Language Selection screen was completed.
export async function hasSelectedLanguage(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored != null && isSupportedLanguage(stored);
}

// Let a feature module register its own translations under a namespace.
// Call after initI18n(); safe to call at runtime (merges into the live store).
export function registerModuleLocales(
  namespace: string,
  byLang: Record<AppLanguage, Record<string, unknown>>,
): void {
  (Object.keys(byLang) as AppLanguage[]).forEach((lang) => {
    i18n.addResourceBundle(lang, namespace, byLang[lang], true, true);
  });
}

// Change language app-wide: persist + switch i18next. RTL/LTR layout follows
// reactively via useIsRTL() + the root direction style — no reload needed.
export async function changeAppLanguage(lang: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;
export * from './config';
