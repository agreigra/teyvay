// Public API of the profile module.
import { registerModuleLocales } from '../../core/i18n';
import { PROFILE_NS } from './constants';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export { PROFILE_NS } from './constants';
export { ProfileScreen } from './screens/ProfileScreen';

export function registerProfileLocales(): void {
  registerModuleLocales(PROFILE_NS, { ar, fr, en });
}
