import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppLanguage, SUPPORTED_LANGUAGES, changeAppLanguage } from '../i18n';
import { colors, radius, spacing, typography } from '../theme';

// Inline language picker. Step 2 introduces the dedicated Language Selection
// screen; this keeps language switching reachable during core development.
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.row}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = i18n.language === lang;
        return (
          <Pressable
            key={lang}
            onPress={() => changeAppLanguage(lang as AppLanguage)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {t(`languages.${lang}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: typography.body,
    color: colors.text,
  },
  labelActive: {
    color: colors.surface,
    fontWeight: '600',
  },
});
