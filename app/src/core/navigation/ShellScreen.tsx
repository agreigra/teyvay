import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Screen } from '../components/Screen';
import { colors, spacing, typography } from '../theme';

// Temporary core shell. Proves the themed UI renders and switches between the
// three languages (with RTL for Arabic). Replaced by real screens in later steps.
export function ShellScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.name')}</Text>
        <Text style={styles.tagline}>{t('app.tagline')}</Text>
      </View>

      <Text style={styles.sectionLabel}>{t('common.language')}</Text>
      <LanguageSwitcher />
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
});
