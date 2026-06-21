import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';

type FeatherName = keyof typeof Feather.glyphMap;

type Props = {
  icon: FeatherName;
  title: string;
  subtitle?: string;
  // Extra content rendered under the title row (e.g. a CTA button).
  children?: ReactNode;
};

// Branded gradient header card, matching the home hero, reused on the
// add-product and my-products screens.
export function GradientHeader({ icon, title, subtitle, children }: Props) {
  const rtl = useIsRTL();
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={[styles.row, rtl && styles.rowRev]}>
        <View style={styles.badge}>
          <Feather name={icon} size={20} color={colors.surface} />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, rtl && rtlTextStyle]}>{title}</Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: colors.surface,
    fontSize: typography.title,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.body,
    marginTop: 2,
  },
});
