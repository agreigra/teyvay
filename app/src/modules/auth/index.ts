// Public API of the auth module.
import { registerModuleLocales } from '../../core/i18n';
import { AUTH_NS } from './constants';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export { AUTH_NS } from './constants';
export { AuthProvider, useAuth } from './hooks/useAuth';
export { AuthStack } from './navigation/AuthStack';
export { RoleSelectScreen } from './screens/RoleSelectScreen';
export { SetNewPasswordScreen } from './screens/SetNewPasswordScreen';
export { changePassword, WrongPasswordError } from './services/auth.service';
export { MIN_AGE, MIN_PASSWORD_LENGTH, maxBirthdate } from './utils';

// Register this module's translations. Call after initI18n().
export function registerAuthLocales(): void {
  registerModuleLocales(AUTH_NS, { ar, fr, en });
}
