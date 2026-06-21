import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
} from './config';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import { applyLayoutDirection, reloadForDirectionChange } from './rtl';

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

  // Align native layout direction on first load.
  applyLayoutDirection(lng);

  return i18n;
}

// Change language app-wide: persist, switch i18next, and flip RTL/LTR if needed.
export async function changeAppLanguage(lang: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
  const directionChanged = applyLayoutDirection(lang);
  if (directionChanged) {
    await reloadForDirectionChange();
  }
}

export default i18n;
export * from './config';
