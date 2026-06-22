import { useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { Button } from '../../../core/components/Button';
import { DateField } from '../../../core/components/DateField';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { countryFromE164, flagEmoji } from '../../../core/data/countries';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { ageFromBirthdate, parseISODate, toISODate } from '../../../core/utils/date';
import {
  AUTH_NS,
  MIN_AGE,
  MIN_PASSWORD_LENGTH,
  WrongPasswordError,
  changePassword,
  maxBirthdate,
  useAuth,
} from '../../auth';
import { PROFILE_NS } from '../constants';
import { softDeleteProfile, updateProfile } from '../services/profile.service';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Editable profile: personal info + soft-delete (deactivate) action.
export function ProfileScreen() {
  const { t } = useTranslation(PROFILE_NS);
  const { profile, refreshProfile, signOut } = useAuth();
  const rtl = useIsRTL();

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [birthdate, setBirthdate] = useState<Date | null>(
    parseISODate(profile?.birthdate),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- Change password ---
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwChanged, setPwChanged] = useState(false);

  const togglePw = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPwOpen((v) => !v);
    setPwError(null);
    setPwChanged(false);
  };

  const onChangePassword = async () => {
    if (!profile?.phone) return;
    if (!currentPw) {
      setPwError(t('errors.wrongPassword'));
      return;
    }
    if (newPw.length < MIN_PASSWORD_LENGTH) {
      setPwError(t('errors.passwordTooShort', { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (newPw !== confirmPw) {
      setPwError(t('errors.passwordsDontMatch'));
      return;
    }
    setPwError(null);
    setPwSaving(true);
    setPwChanged(false);
    try {
      await changePassword(profile.phone, currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwChanged(true);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPwOpen(false);
    } catch (e) {
      setPwError(
        e instanceof WrongPasswordError
          ? t('errors.wrongPassword')
          : t('errors.passwordFailed'),
      );
    } finally {
      setPwSaving(false);
    }
  };

  // Split the stored E.164 phone into country + national parts for display.
  const phone = profile?.phone ?? '';
  const phoneCountry = countryFromE164(phone);
  const phoneNational = phone.startsWith(phoneCountry.dial)
    ? phone.slice(phoneCountry.dial.length)
    : phone;

  const onSave = async () => {
    if (!profile) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError(t('errors.nameRequired'));
      return;
    }
    if (!birthdate || ageFromBirthdate(birthdate) < MIN_AGE) {
      setError(t('errors.ageTooYoung', { min: MIN_AGE }));
      return;
    }
    setError(null);
    setSaving(true);
    setSavedAt(false);
    try {
      await updateProfile(profile.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birthdate: toISODate(birthdate),
      });
      await refreshProfile();
      setSavedAt(true);
    } catch {
      setError(t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(t('delete.title'), t('delete.message'), [
      { text: t('delete.cancel'), style: 'cancel' },
      { text: t('delete.confirm'), style: 'destructive', onPress: runDelete },
    ]);
  };

  const runDelete = async () => {
    if (!profile) return;
    setDeleting(true);
    try {
      await softDeleteProfile(profile.id);
      await signOut();
    } catch {
      setDeleting(false);
      Alert.alert(t('delete.title'), t('errors.deleteFailed'));
    }
  };

  return (
    <Screen scroll underHeader>
      <Field
          label={t('fields.firstName')}
          value={firstName}
          onChangeText={(v) => {
            setFirstName(v);
            setSavedAt(false);
          }}
        />
        <Field
          label={t('fields.lastName')}
          value={lastName}
          onChangeText={(v) => {
            setLastName(v);
            setSavedAt(false);
          }}
        />
        <DateField
          label={t('fields.birthdate')}
          placeholder={t('fields.birthdatePlaceholder')}
          value={birthdate}
          onChange={(d) => {
            setBirthdate(d);
            setSavedAt(false);
          }}
          maximumDate={maxBirthdate()}
          error={error}
        />

        <View style={styles.readonly}>
          <Text style={[styles.roLabel, rtl && rtlTextStyle]}>{t('phone')}</Text>
          {phone ? (
            <>
              {/* Always LTR: flag + code on the left, number on the right. */}
              <View style={styles.phoneDisplay}>
                <Text style={styles.phoneFlag}>{flagEmoji(phoneCountry.iso)}</Text>
                <Text style={styles.phoneDial}>{phoneCountry.dial}</Text>
                <Text style={styles.phoneNational}>{phoneNational}</Text>
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>
              <Text style={[styles.phoneNote, rtl && rtlTextStyle]}>{t('phoneNote')}</Text>
            </>
          ) : (
            <Text style={[styles.roValue, rtl && rtlTextStyle]}>—</Text>
          )}
          <View style={styles.divider} />
          <Text style={[styles.roLabel, rtl && rtlTextStyle]}>{t('role')}</Text>
          <Text style={[styles.roValue, rtl && rtlTextStyle]}>
            {profile ? t(`roleName.${profile.role}`, { ns: AUTH_NS }) : '—'}
          </Text>
        </View>

        {savedAt && <Text style={[styles.saved, rtl && rtlTextStyle]}>{t('saved')}</Text>}

        <Button
          label={saving ? t('saving') : t('save')}
          onPress={onSave}
          loading={saving}
          disabled={deleting}
        />

        {/* Change password */}
        <View style={styles.pwCard}>
          <Pressable
            style={[styles.pwHeader, rtl && styles.rowRev]}
            onPress={togglePw}
          >
            <View style={[styles.pwHeaderLeft, rtl && styles.rowRev]}>
              <Feather name="lock" size={18} color={colors.primary} />
              <Text style={[styles.pwTitle, rtl && rtlTextStyle]}>
                {t('password.title')}
              </Text>
            </View>
            <Feather
              name={pwOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>

          {pwChanged && !pwOpen && (
            <Text style={[styles.pwChanged, rtl && rtlTextStyle]}>
              {t('password.changed')}
            </Text>
          )}

          {pwOpen && (
            <View style={styles.pwBody}>
              <Field
                label={t('password.current')}
                value={currentPw}
                onChangeText={setCurrentPw}
                toggleSecure
                autoComplete="current-password"
              />
              <Field
                label={t('password.new')}
                value={newPw}
                onChangeText={setNewPw}
                toggleSecure
                autoComplete="new-password"
              />
              <Field
                label={t('password.confirm')}
                value={confirmPw}
                onChangeText={setConfirmPw}
                toggleSecure
                autoComplete="new-password"
                error={pwError}
              />
              <Button
                label={pwSaving ? t('password.submitting') : t('password.submit')}
                onPress={onChangePassword}
                loading={pwSaving}
                disabled={saving || deleting}
              />
            </View>
          )}
        </View>

        <Button
          label={t('delete.button')}
          onPress={confirmDelete}
          variant="outline"
          disabled={saving || deleting}
          loading={deleting}
          style={styles.deleteBtn}
        />
    </Screen>
  );
}

const styles = StyleSheet.create({
  readonly: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  roLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  roValue: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  phoneFlag: {
    fontSize: 20,
  },
  phoneDial: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  phoneNational: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  phoneNote: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  saved: {
    color: colors.success,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
  deleteBtn: {
    marginTop: spacing.md,
    borderColor: colors.danger,
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  pwCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  pwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  pwHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pwTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  pwBody: {
    marginTop: spacing.sm,
  },
  pwChanged: {
    color: colors.success,
    fontSize: typography.caption,
    paddingBottom: spacing.sm,
  },
});
