import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { AUTH_NS, useAuth } from '../../auth';
import { PROFILE_NS } from '../constants';

// Placeholder profile view. Step 6 adds editing + soft delete.
export function ProfileScreen() {
  const { t } = useTranslation(PROFILE_NS);
  const { profile } = useAuth();
  const rtl = useIsRTL();

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={[styles.label, rtl && rtlTextStyle]}>{t('phone')}</Text>
        <Text style={[styles.value, rtl && rtlTextStyle]}>{profile?.phone ?? '—'}</Text>
        <View style={styles.divider} />
        <Text style={[styles.label, rtl && rtlTextStyle]}>{t('role')}</Text>
        <Text style={[styles.value, rtl && rtlTextStyle]}>
          {profile ? t(`roleName.${profile.role}`, { ns: AUTH_NS }) : '—'}
        </Text>
      </View>

      <Text style={[styles.muted, rtl && rtlTextStyle]}>{t('comingSoon')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  value: {
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
  muted: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
});
