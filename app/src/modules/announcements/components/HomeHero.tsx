import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { ANNOUNCEMENTS_NS } from '../constants';

type Props = {
  count: number;
  isMerchant: boolean;
  userName?: string;
  onAddProduct: () => void;
};

type FeatherName = keyof typeof Feather.glyphMap;

const FEATURES: { icon: FeatherName; key: string }[] = [
  { icon: 'eye', key: 'featAnon' },
  { icon: 'lock', key: 'featSecure' },
  { icon: 'refresh-cw', key: 'featAdmin' },
];

// Welcome hero on the home/browse screen: greeting, headline, trust chips, and a
// products stat with an add-product CTA for merchants.
export function HomeHero({ count, isMerchant, userName, onAddProduct }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const rtl = useIsRTL();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={[styles.brandPill, rtl ? styles.selfStart : styles.selfEnd]}>
        <View style={styles.dot} />
        <Text style={styles.brandPillText}>{t('app.name', { ns: 'core' })}</Text>
      </View>

      <Text style={[styles.greeting, rtl && rtlTextStyle]}>
        {userName ? t('home.welcomeName', { name: userName }) : t('home.welcome')}
      </Text>
      <Text style={[styles.headline, rtl && rtlTextStyle]}>{t('home.headline')}</Text>

      <View style={[styles.chips, rtl && styles.chipsRtl]}>
        {FEATURES.map((f) => (
          <View key={f.key} style={[styles.chip, rtl && styles.rowRev]}>
            <Feather name={f.icon} size={13} color={colors.surface} />
            <Text style={styles.chipText}>{t(`home.${f.key}`)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.stat}>
        <Ionicons name="sparkles-outline" size={22} color={colors.surface} />
        <Text style={styles.statNumber}>{count}</Text>
        <Text style={styles.statLabel}>{t('home.products')}</Text>

        {isMerchant && (
          <Pressable style={[styles.addBtn, rtl && styles.rowRev]} onPress={onAddProduct}>
            <Feather name="plus" size={18} color={colors.primary} />
            <Text style={styles.addBtnText}>{t('home.addProduct')}</Text>
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}

const TRANSLUCENT = 'rgba(255,255,255,0.15)';
const TRANSLUCENT_BORDER = 'rgba(255,255,255,0.35)';

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  selfStart: { alignSelf: 'flex-start' },
  selfEnd: { alignSelf: 'flex-end' },
  rowRev: { flexDirection: 'row-reverse' },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: TRANSLUCENT,
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  brandPillText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: typography.caption,
  },
  greeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.body,
    marginBottom: spacing.xs,
  },
  headline: {
    color: colors.surface,
    fontSize: typography.title,
    fontWeight: '800',
    lineHeight: 32,
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
  stat: {
    alignItems: 'center',
    backgroundColor: TRANSLUCENT,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  statNumber: {
    color: colors.surface,
    fontSize: 36,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.body,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: typography.body,
  },
});
