import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { colors, spacing, typography } from '../../../core/theme';
import { AUTH_NS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { requestOtp, verifyOtp } from '../services/auth.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

export function OtpVerifyScreen({ route }: Props) {
  const { phone, mode } = route.params;
  const { t } = useTranslation(AUTH_NS);
  const { beginPasswordReset } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // On success the auth state change drives navigation:
  //   register -> session -> onboarding (via the root gate)
  //   reset    -> session + passwordResetPending -> SetNewPassword
  const onVerify = async () => {
    if (code.trim().length < 4) {
      setError(t('errors.invalidCode'));
      return;
    }
    setError(null);
    setLoading(true);
    // Mark the reset flow BEFORE the session appears so the gate routes to the
    // set-password screen instead of the main app.
    if (mode === 'reset') beginPasswordReset();
    try {
      await verifyOtp(phone, code.trim());
    } catch {
      setError(t('errors.invalidCode'));
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      await requestOtp(phone, false);
    } catch {
      setError(t('errors.generic'));
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t('otp.title')}</Text>
        <Text style={styles.subtitle}>{t('otp.subtitle', { phone })}</Text>
      </View>

      <Field
        label={t('otp.codeLabel')}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="sms-otp"
        error={error}
      />

      <Button
        label={loading ? t('otp.verifying') : t('otp.verify')}
        onPress={onVerify}
        loading={loading}
      />

      <Pressable onPress={onResend} style={styles.resend}>
        <Text style={styles.resendText}>{t('otp.resend')}</Text>
      </Pressable>
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
  resend: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  resendText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
