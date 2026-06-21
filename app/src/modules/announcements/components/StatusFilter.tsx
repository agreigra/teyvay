import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useIsRTL } from '../../../core/i18n';
import { colors, radius, spacing, typography } from '../../../core/theme';
import type { AnnouncementStatus } from '../../../core/types/database';
import { ANNOUNCEMENTS_NS } from '../constants';

export type StatusFilterValue = AnnouncementStatus | 'all';

const OPTIONS: StatusFilterValue[] = [
  'all',
  'pending',
  'active',
  'sold',
  'inactive',
  'rejected',
];

type Props = {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
};

// Horizontal status filter chips for the merchant's own-listings view.
export function StatusFilter({ value, onChange }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const rtl = useIsRTL();

  return (
    <View style={[styles.row, rtl && styles.rowRtl]}>
      {OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt === 'all' ? t('filter.all') : t(`status.${opt}`)}
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
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextActive: {
    color: colors.surface,
  },
});
