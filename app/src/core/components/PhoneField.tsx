import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { useIsRTL } from '../i18n';
import {
  COUNTRIES,
  Country,
  countryFromE164,
  flagEmoji,
} from '../data/countries';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';

type Props = {
  label: string;
  // Full E.164 value, e.g. "+22231234567".
  value: string;
  onChangeText: (e164: string) => void;
  placeholder?: string;
  error?: string | null;
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, '');

// Phone input with a left-pinned country selector. The input row is always
// laid out LTR (flag + code on the left, number on the right) regardless of
// app language, since phone numbers read left-to-right everywhere.
export function PhoneField({ label, value, onChangeText, placeholder, error }: Props) {
  const { t } = useTranslation();
  const rtl = useIsRTL();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Derive the active country from the dialing-code prefix of the value.
  const country = useMemo(() => countryFromE164(value), [value]);
  const national = value.startsWith(country.dial)
    ? value.slice(country.dial.length)
    : onlyDigits(value);

  const setNational = (text: string) => onChangeText(country.dial + onlyDigits(text));

  const selectCountry = (c: Country) => {
    onChangeText(c.dial + national);
    setPickerOpen(false);
    setQuery('');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, rtl && rtlTextStyle]}>{label}</Text>

      {/* Always LTR: selector left, number right. */}
      <View style={[styles.row, !!error && styles.rowError]}>
        <Pressable style={styles.selector} onPress={() => setPickerOpen(true)}>
          <Text style={styles.flag}>{flagEmoji(country.iso)}</Text>
          <Text style={styles.dial}>{country.dial}</Text>
          <Feather name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          value={national}
          onChangeText={setNational}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </View>
      {!!error && <Text style={[styles.error, rtl && rtlTextStyle]}>{error}</Text>}

      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)} />
          <View style={styles.sheet}>
            <View style={[styles.sheetHead, rtl && styles.rowRev]}>
              <Text style={[styles.sheetTitle, rtl && rtlTextStyle]}>
                {t('phone.selectCountry')}
              </Text>
              <Pressable hitSlop={8} onPress={() => setPickerOpen(false)}>
                <Feather name="x" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={[styles.search, rtl && styles.rowRev]}>
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, rtl && rtlTextStyle]}
                value={query}
                onChangeText={setQuery}
                placeholder={t('phone.searchPlaceholder')}
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(c) => c.iso}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.iso === country.iso;
                return (
                  <Pressable
                    style={[styles.countryRow, selected && styles.countryRowActive]}
                    onPress={() => selectCountry(item)}
                  >
                    <Text style={styles.flag}>{flagEmoji(item.iso)}</Text>
                    <Text style={styles.countryName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.countryDial}>{item.dial}</Text>
                    {selected && <Feather name="check" size={18} color={colors.primary} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rowRev: { flexDirection: 'row-reverse' },
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  rowError: {
    borderColor: colors.danger,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  flag: {
    fontSize: 20,
  },
  dial: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    // Force LTR so digits never flip in Arabic.
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  countryRowActive: {
    backgroundColor: colors.primarySoft,
  },
  countryName: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  countryDial: {
    fontSize: typography.body,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
