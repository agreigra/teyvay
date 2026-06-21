import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, spacing, typography } from '../theme';

type Props = {
  // Show the tagline under the wordmark (off on dense screens like Register).
  showTagline?: boolean;
};

// App logo/branding: a chevron mark (matching the app icon) + the Teyvay
// wordmark. Centered and language-neutral, so it needs no RTL handling.
export function Brand({ showTagline = true }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.mark}>∧</Text>
      </View>
      <Text style={styles.name}>{t('app.name')}</Text>
      {showTagline && <Text style={styles.tagline}>{t('app.tagline')}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    color: colors.surface,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
    marginTop: 6,
  },
  name: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
