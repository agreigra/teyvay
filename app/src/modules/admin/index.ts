// Public API of the admin module.
import { registerModuleLocales } from '../../core/i18n';
import { ADMIN_NS } from './constants';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export { ADMIN_NS } from './constants';
export { AdminHomeScreen } from './screens/AdminHomeScreen';
export { listProfiles, setUserRole } from './services/admin.service';

export function registerAdminLocales(): void {
  registerModuleLocales(ADMIN_NS, { ar, fr, en });
}
