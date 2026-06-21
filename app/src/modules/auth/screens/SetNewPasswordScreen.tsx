import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { AUTH_NS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { updatePassword } from '../services/auth.service';
import { MIN_PASSWORD_LENGTH } from '../utils';

// Shown by the root gate when a recovery OTP has created a session but the user
// still needs to choose a new password.
export function SetNewPasswordScreen() {
  const { t } = useTranslation(AUTH_NS);
  const rtl = useIsRTL();
  const { completePasswordReset } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('errors.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('errors.passwordsDontMatch'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await updatePassword(password);
      // Clear the pending flag -> gate proceeds to onboarding / main app.
      completePasswordReset();
    } catch {
      setError(t('errors.generic'));
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, rtl && rtlTextStyle]}>{t('setPassword.title')}</Text>
        <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{t('setPassword.subtitle')}</Text>
      </View>

      <Field
        label={t('setPassword.newPasswordLabel')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <Field
        label={t('setPassword.confirmLabel')}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
        error={error}
      />

      <Button
        label={loading ? t('setPassword.submitting') : t('setPassword.submit')}
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
