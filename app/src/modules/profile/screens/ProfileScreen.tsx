import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { AUTH_NS, useAuth } from '../../auth';
import { PROFILE_NS } from '../constants';
import { softDeleteProfile, updateProfile } from '../services/profile.service';

const MIN_AGE = 18;

// Editable profile: personal info + soft-delete (deactivate) action.
export function ProfileScreen() {
  const { t } = useTranslation(PROFILE_NS);
  const { profile, refreshProfile, signOut } = useAuth();
  const rtl = useIsRTL();

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [age, setAge] = useState(profile?.age != null ? String(profile.age) : '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onSave = async () => {
    if (!profile) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError(t('errors.nameRequired'));
      return;
    }
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < MIN_AGE) {
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
        age: ageNum,
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
        <Field
          label={t('fields.age')}
          value={age}
          onChangeText={(v) => {
            setAge(v);
            setSavedAt(false);
          }}
          keyboardType="number-pad"
          maxLength={3}
          error={error}
        />

        <View style={styles.readonly}>
          <Text style={[styles.roLabel, rtl && rtlTextStyle]}>{t('phone')}</Text>
          <Text style={[styles.roValue, rtl && rtlTextStyle]}>{profile?.phone ?? '—'}</Text>
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
});
