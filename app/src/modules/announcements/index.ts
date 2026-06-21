// Public API of the announcements module.
import { registerModuleLocales } from '../../core/i18n';
import { ANNOUNCEMENTS_NS } from './constants';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export { ANNOUNCEMENTS_NS } from './constants';
export { AnnouncementsStack } from './navigation/AnnouncementsStack';

// Register this module's translations. Call after initI18n().
export function registerAnnouncementsLocales(): void {
  registerModuleLocales(ANNOUNCEMENTS_NS, { ar, fr, en });
}
