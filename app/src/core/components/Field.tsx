import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
};

export function Field({ label, error, style, ...inputProps }: Props) {
  const rtl = useIsRTL();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, rtl && rtlTextStyle]}>{label}</Text>
      <TextInput
        style={[styles.input, rtl && rtlTextStyle, !!error && styles.inputError, style]}
        placeholderTextColor={colors.textMuted}
        {...inputProps}
      />
      {!!error && <Text style={[styles.error, rtl && rtlTextStyle]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    // textAlign omitted: RN auto-aligns by writing direction for RTL.
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
});
