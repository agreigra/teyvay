import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { ANNOUNCEMENTS_NS } from '../constants';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
};

// Rounded search field that filters the listings on the home screen.
export function SearchBar({ value, onChangeText }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const rtl = useIsRTL();

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <Feather name="search" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('home.search')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, rtl && rtlTextStyle]}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
  },
  wrapRtl: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    paddingVertical: 0,
  },
});
