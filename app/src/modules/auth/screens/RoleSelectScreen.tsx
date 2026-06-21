import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../core/components/Button';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import type { UserRole } from '../../../core/types/database';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { AUTH_NS } from '../constants';
import { useAuth } from '../hooks/useAuth';

// Onboarding: the user confirms whether they sell (merchant) or buy (client).
// admin is never self-assignable here — it's granted via SQL only.
export function RoleSelectScreen() {
  const { t } = useTranslation(AUTH_NS);
  const rtl = useIsRTL();
  const { selectRole } = useAuth();
  const [saving, setSaving] = useState<UserRole | null>(null);

  const choose = async (role: UserRole) => {
    if (saving) return;
    setSaving(role);
    try {
      await selectRole(role);
    } finally {
      setSaving(null);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, rtl && rtlTextStyle]}>{t('role.title')}</Text>
        <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{t('role.subtitle')}</Text>
      </View>

      <View style={styles.options}>
        <Button
          label={saving === 'merchant' ? t('role.saving') : t('role.merchant')}
          onPress={() => choose('merchant')}
          loading={saving === 'merchant'}
          disabled={saving != null}
        />
        <Button
          label={saving === 'client' ? t('role.saving') : t('role.client')}
          onPress={() => choose('client')}
          loading={saving === 'client'}
          disabled={saving != null}
          variant="outline"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
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
  options: {
    gap: spacing.md,
  },
});
