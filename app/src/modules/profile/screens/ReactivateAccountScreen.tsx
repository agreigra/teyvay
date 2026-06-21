import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../core/components/Button';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { useAuth } from '../../auth';
import { PROFILE_NS } from '../constants';
import { reactivateProfile } from '../services/profile.service';

// Shown when a soft-deleted user signs back in: reactivate or sign out.
export function ReactivateAccountScreen() {
  const { t } = useTranslation(PROFILE_NS);
  const rtl = useIsRTL();
  const { profile, refreshProfile, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const reactivate = async () => {
    if (!profile) return;
    setBusy(true);
    try {
      await reactivateProfile(profile.id);
      await refreshProfile();
    } catch {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={[styles.title, rtl && rtlTextStyle]}>{t('reactivate.title')}</Text>
        <Text style={[styles.message, rtl && rtlTextStyle]}>{t('reactivate.message')}</Text>

        <View style={styles.actions}>
          <Button
            label={busy ? t('reactivate.working') : t('reactivate.confirm')}
            onPress={reactivate}
            loading={busy}
          />
          <Button
            label={t('reactivate.signOut')}
            onPress={signOut}
            variant="outline"
            disabled={busy}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
});
