import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Brand } from '../components/Brand';
import { Screen } from '../components/Screen';
import { useIsRTL } from '../i18n';
import { colors, rtlTextStyle, spacing, typography } from '../theme';

// "About the platform" page reached from the menu.
export function AboutScreen() {
  const { t } = useTranslation();
  const rtl = useIsRTL();

  return (
    <Screen scroll underHeader>
      <View style={styles.brand}>
        <Brand />
      </View>

      <Text style={[styles.body, rtl && rtlTextStyle]}>{t('about.body')}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t('about.version')}</Text>
        <Text style={styles.metaValue}>1.0.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaLabel: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});
