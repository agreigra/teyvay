import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Brand } from '../../../core/components/Brand';
import { Button } from '../../../core/components/Button';
import { DateField } from '../../../core/components/DateField';
import { Field } from '../../../core/components/Field';
import { PhoneField } from '../../../core/components/PhoneField';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { ageFromBirthdate, toISODate } from '../../../core/utils/date';
import { AUTH_NS, DEFAULT_COUNTRY_CODE } from '../constants';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { signUpWithPassword } from '../services/auth.service';
import {
  MIN_AGE,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  isValidPhone,
  maxBirthdate,
  normalizePhone,
} from '../utils';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation(AUTH_NS);
  const rtl = useIsRTL();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(DEFAULT_COUNTRY_CODE);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError(t('errors.nameRequired'));
      return;
    }
    if (!birthdate || ageFromBirthdate(birthdate) < MIN_AGE) {
      setError(t('errors.ageTooYoung', { min: MIN_AGE }));
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }
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
      await signUpWithPassword(normalized, password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birthdate: toISODate(birthdate),
        email: email.trim() || undefined,
      });
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
    <Screen scroll underHeader>
      <View style={styles.brand}>
        <Brand showTagline={false} />
      </View>

        <View style={styles.header}>
          <Text style={[styles.title, rtl && rtlTextStyle]}>{t('register.title')}</Text>
          <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{t('register.subtitle')}</Text>
        </View>

        <Field
          label={t('register.firstNameLabel')}
          value={firstName}
          onChangeText={setFirstName}
          autoComplete="name-given"
        />
        <Field
          label={t('register.lastNameLabel')}
          value={lastName}
          onChangeText={setLastName}
          autoComplete="name-family"
        />
        <DateField
          label={t('register.birthdateLabel')}
          placeholder={t('register.birthdatePlaceholder')}
          value={birthdate}
          onChange={setBirthdate}
          maximumDate={maxBirthdate()}
        />
        <Field
          label={t('register.emailLabel')}
          placeholder={t('register.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <PhoneField
          label={t('signIn.phoneLabel')}
          placeholder={t('signIn.phonePlaceholder')}
          value={phone}
          onChangeText={setPhone}
        />
        <Field
          label={t('register.passwordLabel')}
          value={password}
          onChangeText={setPassword}
          toggleSecure
          autoComplete="new-password"
        />
        <Field
          label={t('register.confirmLabel')}
          value={confirm}
          onChangeText={setConfirm}
          toggleSecure
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
  brand: {
    marginTop: spacing.lg,
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
});
