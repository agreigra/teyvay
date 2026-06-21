import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../../core/components/Screen';
import {
  AppLanguage,
  SUPPORTED_LANGUAGES,
  changeAppLanguage,
} from '../../../core/i18n';
import { colors, radius, spacing, typography } from '../../../core/theme';
import { SETTINGS_NS } from '../constants';

type Props = {
  // Called once a language is chosen and applied (when no reload is triggered).
  onDone: () => void;
};

// First-launch language picker. Each option is shown in its own script so it's
// recognizable regardless of the current language.
export function LanguageSelectScreen({ onDone }: Props) {
  const { t } = useTranslation(SETTINGS_NS);
  const [busy, setBusy] = useState(false);

  const select = async (lang: AppLanguage) => {
    if (busy) return;
    setBusy(true);
    await changeAppLanguage(lang);
    // If an RTL/LTR flip triggered a reload, this line never runs; otherwise
    // we advance to the app shell.
    onDone();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t('languageSelect.title')}</Text>
        <Text style={styles.subtitle}>{t('languageSelect.subtitle')}</Text>
      </View>

      <View style={styles.options}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            onPress={() => select(lang)}
            disabled={busy}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          >
            <Text style={styles.optionText}>{t(`languages.${lang}`, { ns: 'core' })}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  options: {
    gap: spacing.md,
  },
  option: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  optionPressed: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
  },
});
