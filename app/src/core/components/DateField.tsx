import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';
import { formatDisplayDate } from '../utils/date';

type Props = {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  error?: string | null;
  maximumDate?: Date;
  minimumDate?: Date;
};

// Date selector field: a pressable row showing the chosen date (or placeholder)
// that opens the native picker — a dialog on Android, an inline spinner in a
// bottom sheet on iOS. Expo Go compatible.
export function DateField({
  label,
  value,
  onChange,
  placeholder,
  error,
  maximumDate,
  minimumDate,
}: Props) {
  const { t, i18n } = useTranslation();
  const rtl = useIsRTL();
  const [show, setShow] = useState(false);
  // iOS edits a temp value committed on "Done"; Android commits immediately.
  const [temp, setTemp] = useState<Date | null>(null);

  const fallback = maximumDate ?? new Date();
  const open = () => {
    setTemp(value ?? fallback);
    setShow(true);
  };

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && date) onChange(date);
      return;
    }
    if (date) setTemp(date);
  };

  const confirmIOS = () => {
    if (temp) onChange(temp);
    setShow(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, rtl && rtlTextStyle]}>{label}</Text>

      <Pressable
        style={[styles.row, rtl && styles.rowRev, !!error && styles.rowError]}
        onPress={open}
      >
        <Text
          style={[
            styles.value,
            rtl && rtlTextStyle,
            !value && styles.placeholder,
          ]}
        >
          {value ? formatDisplayDate(value, i18n.language) : placeholder ?? ''}
        </Text>
        <Feather name="calendar" size={18} color={colors.textMuted} />
      </Pressable>
      {!!error && <Text style={[styles.error, rtl && rtlTextStyle]}>{error}</Text>}

      {/* Android: bare dialog. */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value ?? fallback}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={onPickerChange}
        />
      )}

      {/* iOS: spinner in a bottom sheet with a Done action. */}
      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.backdrop} onPress={() => setShow(false)} />
            <View style={styles.sheet}>
              <View style={[styles.sheetBar, rtl && styles.rowRev]}>
                <Pressable hitSlop={8} onPress={() => setShow(false)}>
                  <Text style={styles.sheetCancel}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable hitSlop={8} onPress={confirmIOS}>
                  <Text style={styles.sheetDone}>{t('date.done')}</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={temp ?? fallback}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={onPickerChange}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}
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
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowError: {
    borderColor: colors.danger,
  },
  value: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.lg,
  },
  sheetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetCancel: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  sheetDone: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
});
