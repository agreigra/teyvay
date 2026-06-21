import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AUTH_NS, useAuth } from '../../modules/auth';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Screen } from '../components/Screen';
import { colors, radius, spacing, typography } from '../theme';

// Temporary core shell. Proves the themed UI renders, switches between the three
// languages (RTL for Arabic), and reflects the signed-in user's role. Replaced
// by role-based home screens in later steps.
export function ShellScreen() {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.name')}</Text>
        <Text style={styles.tagline}>{t('app.tagline')}</Text>
      </View>

      {profile && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{profile.phone ?? '—'}</Text>
          <Text style={styles.role}>{profile.role}</Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>{t('common.language')}</Text>
      <LanguageSwitcher />

      <View style={styles.spacer} />
      <Button
        label={t('signOut', { ns: AUTH_NS })}
        onPress={signOut}
        variant="outline"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.primary,
  },
  tagline: {
    fontSize: typography.subtitle,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  cardLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  role: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  spacer: {
    flex: 1,
  },
});
