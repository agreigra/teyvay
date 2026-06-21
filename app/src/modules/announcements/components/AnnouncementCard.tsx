import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { formatPrice } from '../../../core/utils/format';
import type { Announcement } from '../../../core/types/database';
import { ANNOUNCEMENTS_NS } from '../constants';

const statusColor: Record<Announcement['status'], string> = {
  active: colors.success,
  sold: colors.textMuted,
  inactive: colors.danger,
};

type Props = {
  item: Announcement;
  onPress: () => void;
  // Show the status pill (merchant/admin views); hidden in the client browse.
  showStatus?: boolean;
};

export function AnnouncementCard({ item, onPress, showStatus = false }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const rtl = useIsRTL();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.row, rtl && styles.rowRtl]}>
        <Text style={[styles.title, rtl && rtlTextStyle]} numberOfLines={1}>
          {item.title}
        </Text>
        {showStatus && (
          <Text style={[styles.status, { color: statusColor[item.status] }]}>
            {t(`status.${item.status}`)}
          </Text>
        )}
      </View>
      <Text style={[styles.price, rtl && rtlTextStyle]}>{formatPrice(item.price)}</Text>
      {!!item.description && (
        <Text style={[styles.description, rtl && rtlTextStyle]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  title: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  price: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
