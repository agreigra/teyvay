// Public API of the settings module. Other modules / core import only from here.
import { registerModuleLocales } from '../../core/i18n';
import { SETTINGS_NS } from './constants';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export { SETTINGS_NS } from './constants';
export { LanguageSelectScreen } from './screens/LanguageSelectScreen';
export {
  getAdminWhatsappNumber,
  setAdminWhatsappNumber,
} from './services/settings.service';

// Register this module's translations. Call after initI18n().
export function registerSettingsLocales(): void {
  registerModuleLocales(SETTINGS_NS, { ar, fr, en });
}
