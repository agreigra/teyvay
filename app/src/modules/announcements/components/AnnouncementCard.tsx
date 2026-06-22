import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { CURRENCY, formatAmount, refCode } from '../../../core/utils/format';
import type { Announcement } from '../../../core/types/database';
import { ANNOUNCEMENTS_NS } from '../constants';
import { localizedDescription, localizedTitle } from '../utils';

type FeatherName = keyof typeof Feather.glyphMap;

const statusMeta: Record<Announcement['status'], { color: string; bg: string; icon: FeatherName }> = {
  pending: { color: '#D97706', bg: 'rgba(217,119,6,0.12)', icon: 'clock' },
  active: { color: colors.success, bg: 'rgba(22,163,74,0.12)', icon: 'check-circle' },
  sold: { color: colors.textMuted, bg: 'rgba(107,114,128,0.14)', icon: 'shopping-bag' },
  inactive: { color: colors.danger, bg: 'rgba(220,38,38,0.12)', icon: 'slash' },
  rejected: { color: colors.danger, bg: 'rgba(220,38,38,0.12)', icon: 'x-circle' },
};

type Props = {
  item: Announcement;
  onPress: () => void;
  // Show the status pill (merchant/admin views); hidden in the client browse.
  showStatus?: boolean;
};

export function AnnouncementCard({ item, onPress, showStatus = false }: Props) {
  const { t, i18n } = useTranslation(ANNOUNCEMENTS_NS);
  const rtl = useIsRTL();
  const status = statusMeta[item.status];
  const title = localizedTitle(item, i18n.language);
  const description = localizedDescription(item, i18n.language);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.topRow, rtl && styles.rowRev]}>
        <Text style={styles.ref}>#{refCode(item.id)}</Text>
        {showStatus && (
          <View style={[styles.pill, { backgroundColor: status.bg }, rtl && styles.rowRev]}>
            <Feather name={status.icon} size={12} color={status.color} />
            <Text style={[styles.pillText, { color: status.color }]}>
              {t(`status.${item.status}`)}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, rtl && rtlTextStyle]} numberOfLines={1}>
        {title}
      </Text>
      {!!description && (
        <Text style={[styles.description, rtl && rtlTextStyle]} numberOfLines={2}>
          {description}
        </Text>
      )}

      <View style={[styles.priceRow, rtl && styles.rowRev]}>
        <View style={[styles.priceGroup, rtl && styles.rowRev]}>
          <Text style={styles.price}>{formatAmount(item.price)}</Text>
          <Text style={styles.currency}>{CURRENCY}</Text>
        </View>
        {item.quantity != null && (
          <View style={[styles.qty, rtl && styles.rowRev]}>
            <Feather name="box" size={13} color={colors.textMuted} />
            <Text style={styles.qtyText}>{formatAmount(item.quantity)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ref: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  pillText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  price: {
    fontSize: typography.title,
    fontWeight: '900',
    color: colors.primary,
  },
  currency: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  qtyText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
