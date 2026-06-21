import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { colors, spacing, typography } from '../../../core/theme';
import { AUTH_NS, DEFAULT_COUNTRY_CODE } from '../constants';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { requestOtp } from '../services/auth.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneLogin'>;

// Basic E.164 check: leading + and 8–15 digits.
const isValidPhone = (p: string) => /^\+\d{8,15}$/.test(p.replace(/\s/g, ''));

export function PhoneLoginScreen({ navigation }: Props) {
  const { t } = useTranslation(AUTH_NS);
  const [phone, setPhone] = useState(DEFAULT_COUNTRY_CODE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    const normalized = phone.replace(/\s/g, '');
    if (!isValidPhone(normalized)) {
      setError(t('errors.invalidPhone'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestOtp(normalized);
      navigation.navigate('OtpVerify', { phone: normalized });
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
      </View>

      <Field
        label={t('login.phoneLabel')}
        placeholder={t('login.phonePlaceholder')}
        value={phone}
        onChangeText={(v) => setPhone(v)}
        keyboardType="phone-pad"
        autoComplete="tel"
        error={error}
      />

      <Button
        label={loading ? t('login.sending') : t('login.sendCode')}
        onPress={onSend}
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
