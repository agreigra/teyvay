import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import type { Profile, UserRole } from '../../../core/types/database';
import { AUTH_NS } from '../../auth';
import { ADMIN_NS } from '../constants';

const ROLES: UserRole[] = ['client', 'merchant', 'admin'];

type Props = {
  item: Profile;
  busy?: boolean;
  // Disable role editing for the signed-in admin's own row.
  isSelf?: boolean;
  onChangeRole: (role: UserRole) => void;
  onViewListings: () => void;
};

export function UserRow({ item, busy, isSelf, onChangeRole, onViewListings }: Props) {
  const { t } = useTranslation(ADMIN_NS);
  const rtl = useIsRTL();

  return (
    <View style={styles.card}>
      <View style={[styles.headerRow, rtl && styles.rowRtl]}>
        <Text style={[styles.name, rtl && rtlTextStyle]} numberOfLines={1}>
          {item.display_name || item.phone || t('users.unnamed')}
        </Text>
        <Pressable onPress={onViewListings} hitSlop={6}>
          <Text style={[styles.link, rtl && rtlTextStyle]}>{t('users.viewListings')}</Text>
        </Pressable>
      </View>

      {!!item.display_name && !!item.phone && (
        <Text style={[styles.phone, rtl && rtlTextStyle]}>{item.phone}</Text>
      )}

      <View style={[styles.roleRow, rtl && styles.rowRtl]}>
        {ROLES.map((role) => {
          const active = role === item.role;
          const disabled = busy || isSelf || active;
          return (
            <Pressable
              key={role}
              disabled={disabled}
              onPress={() => onChangeRole(role)}
              style={[styles.chip, active && styles.chipActive, disabled && !active && styles.chipDisabled]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(`roleName.${role}`, { ns: AUTH_NS })}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  name: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  link: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  phone: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: colors.surface,
  },
});
