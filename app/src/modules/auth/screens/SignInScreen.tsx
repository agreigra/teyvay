import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Brand } from '../../../core/components/Brand';
import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { AUTH_NS, DEFAULT_COUNTRY_CODE } from '../constants';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { signInWithPassword } from '../services/auth.service';
import { isValidPhone, normalizePhone } from '../utils';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { t } = useTranslation(AUTH_NS);
  const { closeAuth } = useAuth();
  const rtl = useIsRTL();
  const [phone, setPhone] = useState(DEFAULT_COUNTRY_CODE);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!isValidPhone(phone)) {
      setError(t('errors.invalidPhone'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Success triggers the auth state change; the gate routes onward.
      await signInWithPassword(normalizePhone(phone), password);
    } catch {
      setError(t('errors.invalidCredentials'));
      setLoading(false);
    }
  };

  return (
    <Screen scroll underHeader>
      <View style={styles.brand}>
        <Brand />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, rtl && rtlTextStyle]}>{t('signIn.title')}</Text>
        <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{t('signIn.subtitle')}</Text>
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
        label={t('signIn.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        toggleSecure
        autoComplete="current-password"
        error={error}
      />

      <Button
        label={loading ? t('signIn.submitting') : t('signIn.submit')}
        onPress={onSubmit}
        loading={loading}
      />

      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.link}>
        <Text style={styles.linkText}>{t('signIn.forgot')}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkText}>{t('signIn.noAccount')}</Text>
      </Pressable>
      <Pressable onPress={closeAuth} style={styles.link}>
        <Text style={styles.browseText}>{t('signIn.browse')}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    marginTop: spacing.xl,
  },
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
  browseText: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
});
