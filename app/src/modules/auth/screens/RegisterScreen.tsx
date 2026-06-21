import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { AUTH_NS, DEFAULT_COUNTRY_CODE } from '../constants';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { signUpWithPassword } from '../services/auth.service';
import { MIN_PASSWORD_LENGTH, isValidPhone, normalizePhone } from '../utils';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation(AUTH_NS);
  const rtl = useIsRTL();
  const [phone, setPhone] = useState(DEFAULT_COUNTRY_CODE);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!isValidPhone(phone)) {
      setError(t('errors.invalidPhone'));
      return;
    }
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
    const normalized = normalizePhone(phone);
    try {
      await signUpWithPassword(normalized, password);
      navigation.navigate('OtpVerify', { phone: normalized, mode: 'register' });
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? '';
      setError(
        /already|registered|exists/i.test(msg)
          ? t('errors.userExists')
          : t('errors.generic'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, rtl && rtlTextStyle]}>{t('register.title')}</Text>
        <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{t('register.subtitle')}</Text>
      </View>

      <Field
        label={t('signIn.phoneLabel')}
        placeholder={t('signIn.phonePlaceholder')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <Field
        label={t('register.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <Field
        label={t('register.confirmLabel')}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
        error={error}
      />

      <Button
        label={loading ? t('register.submitting') : t('register.submit')}
        onPress={onSubmit}
        loading={loading}
      />

      <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.link}>
        <Text style={styles.linkText}>{t('register.haveAccount')}</Text>
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
  link: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
