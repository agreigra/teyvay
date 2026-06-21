import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  // When true, renders a show/hide eye toggle and manages visibility itself.
  toggleSecure?: boolean;
};

export function Field({ label, error, style, toggleSecure, ...inputProps }: Props) {
  const rtl = useIsRTL();
  const [revealed, setRevealed] = useState(false);
  const secure = toggleSecure ? !revealed : inputProps.secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, rtl && rtlTextStyle]}>{label}</Text>
      <View style={[styles.inputRow, rtl && styles.inputRowRtl, !!error && styles.inputError]}>
        <TextInput
          {...inputProps}
          secureTextEntry={secure}
          style={[styles.input, rtl && rtlTextStyle, style]}
          placeholderTextColor={colors.textMuted}
        />
        {toggleSecure && (
          <Pressable hitSlop={8} onPress={() => setRevealed((v) => !v)} style={styles.eye}>
            <Text style={styles.eyeIcon}>{revealed ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputRowRtl: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    // textAlign omitted: RN auto-aligns by writing direction for RTL.
  },
  inputError: {
    borderColor: colors.danger,
  },
  eye: {
    paddingHorizontal: spacing.xs,
  },
  eyeIcon: {
    fontSize: 18,
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
});
