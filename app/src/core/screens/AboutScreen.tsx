import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen } from '../components/Screen';
import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';

type FeatherName = keyof typeof Feather.glyphMap;

const FEATURES: { icon: FeatherName; key: string }[] = [
  { icon: 'eye', key: 'featAnon' },
  { icon: 'lock', key: 'featSecure' },
  { icon: 'shield', key: 'featAdmin' },
];

const STEPS = [1, 2, 3, 4];
const RULES = [1, 2, 3, 4];

export function AboutScreen() {
  const { t } = useTranslation();
  const rtl = useIsRTL();

  return (
    <Screen scroll underHeader>
      {/* Hero: what is Teyvay */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={[styles.heroBadge, { alignSelf: rtl ? 'flex-end' : 'flex-start' }]}>
          <Feather name="shield" size={22} color={colors.surface} />
        </View>
        <Text style={[styles.heroTitle, rtl && rtlTextStyle]}>{t('about.whatTitle')}</Text>
        <Text style={[styles.heroBody, rtl && rtlTextStyle]}>{t('about.whatBody')}</Text>

        <View style={[styles.chips, rtl && styles.chipsRtl]}>
          {FEATURES.map((f) => (
            <View key={f.key} style={[styles.chip, rtl && styles.rowRev]}>
              <Feather name={f.icon} size={13} color={colors.surface} />
              <Text style={styles.chipText}>{t(`about.${f.key}`)}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* How it works */}
      <View style={[styles.sectionHead, rtl && styles.rowRev]}>
        <Feather name="users" size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, rtl && rtlTextStyle]}>{t('about.howTitle')}</Text>
      </View>
      {STEPS.map((n) => (
        <View key={n} style={[styles.stepCard, rtl && styles.rowRev]}>
          <View style={styles.stepText}>
            <Text style={[styles.stepTitle, rtl && rtlTextStyle]}>{t(`about.step${n}Title`)}</Text>
            <Text style={[styles.stepBody, rtl && rtlTextStyle]}>{t(`about.step${n}Body`)}</Text>
          </View>
          <Text style={styles.stepNum}>{String(n).padStart(2, '0')}</Text>
        </View>
      ))}

      {/* Safety rules */}
      <View style={[styles.sectionHead, rtl && styles.rowRev]}>
        <Feather name="alert-triangle" size={18} color="#D97706" />
        <Text style={[styles.sectionTitle, rtl && rtlTextStyle]}>{t('about.rulesTitle')}</Text>
      </View>
      <View style={styles.rulesCard}>
        {RULES.map((n) => (
          <View key={n} style={[styles.ruleRow, rtl && styles.rowRev]}>
            <Feather name="check-circle" size={16} color={colors.primary} />
            <Text style={[styles.ruleText, rtl && rtlTextStyle]}>{t(`about.rule${n}`)}</Text>
          </View>
        ))}
      </View>

      {/* Protected identity */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.privacy}
      >
        <View style={[styles.privacyHead, rtl && styles.rowRev]}>
          <Feather name="lock" size={16} color={colors.surface} />
          <Text style={[styles.privacyTitle, rtl && rtlTextStyle]}>{t('about.privacyTitle')}</Text>
        </View>
        <Text style={[styles.privacyBody, rtl && rtlTextStyle]}>{t('about.privacyBody')}</Text>
      </LinearGradient>

      <Text style={styles.footer}>{t('about.footer')}</Text>
    </Screen>
  );
}

const TRANSLUCENT = 'rgba(255,255,255,0.15)';
const TRANSLUCENT_BORDER = 'rgba(255,255,255,0.35)';

const styles = StyleSheet.create({
  rowRev: { flexDirection: 'row-reverse' },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: TRANSLUCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipsRtl: {
    justifyContent: 'flex-end',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: TRANSLUCENT,
    borderWidth: 1,
    borderColor: TRANSLUCENT_BORDER,
    borderRadius: radius.lg,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    color: colors.surface,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  stepBody: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 19,
  },
  stepNum: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.border,
  },
  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  ruleText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  privacy: {
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  privacyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  privacyTitle: {
    flex: 1,
    color: colors.surface,
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  privacyBody: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.body,
    lineHeight: 23,
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.lg,
  },
});
