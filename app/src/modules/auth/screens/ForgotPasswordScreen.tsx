import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { PhoneField } from '../../../core/components/PhoneField';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { AUTH_NS, DEFAULT_COUNTRY_CODE } from '../constants';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { requestOtp } from '../services/auth.service';
import { isValidPhone, normalizePhone } from '../utils';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation(AUTH_NS);
  const rtl = useIsRTL();
  const [phone, setPhone] = useState(DEFAULT_COUNTRY_CODE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!isValidPhone(phone)) {
      setError(t('errors.invalidPhone'));
      return;
    }
    setError(null);
    setLoading(true);
    const normalized = normalizePhone(phone);
    try {
      // Recovery: only send OTP to an existing account.
      await requestOtp(normalized, false);
      navigation.navigate('OtpVerify', { phone: normalized, mode: 'reset' });
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? '';
      setError(
        /not found|no user|signups not allowed/i.test(msg)
          ? t('errors.userNotFound')
          : t('errors.generic'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll underHeader>
      <View style={styles.header}>
        <Text style={[styles.title, rtl && rtlTextStyle]}>{t('forgot.title')}</Text>
        <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{t('forgot.subtitle')}</Text>
      </View>

      <PhoneField
        label={t('signIn.phoneLabel')}
        placeholder={t('signIn.phonePlaceholder')}
        value={phone}
        onChangeText={setPhone}
        error={error}
      />

      <Button
        label={loading ? t('forgot.submitting') : t('forgot.submit')}
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
