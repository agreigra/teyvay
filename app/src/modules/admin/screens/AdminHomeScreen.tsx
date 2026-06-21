import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { ADMIN_NS } from '../constants';

// Placeholder admin home. Step 5 builds the dashboard (all listings + users).
export function AdminHomeScreen() {
  const { t } = useTranslation(ADMIN_NS);
  const rtl = useIsRTL();
  return (
    <Screen>
      <Text style={[styles.muted, rtl && rtlTextStyle]}>{t('comingSoon')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
});
