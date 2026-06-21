import { I18nManager } from 'react-native';

import { isRtlLanguage } from './config';

// Align the native layout direction with the selected language.
// Returns true if a direction CHANGE happened (native layout requires an app
// reload to fully apply RTL/LTR flips).
export function applyLayoutDirection(lang: string): boolean {
  const shouldBeRtl = isRtlLanguage(lang);
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== shouldBeRtl) {
    I18nManager.forceRTL(shouldBeRtl);
    return true;
  }
  return false;
}

// Best-effort reload so an RTL/LTR change takes effect. Uses expo-updates if
// present (production); in dev, fast refresh applies it on next reload.
export async function reloadForDirectionChange(): Promise<void> {
  try {
    // Optional dependency — only present in some setups.
    const Updates = require('expo-updates');
    if (Updates?.reloadAsync) {
      await Updates.reloadAsync();
    }
  } catch {
    // No expo-updates: dev fast-refresh / manual reload will pick it up.
  }
}
