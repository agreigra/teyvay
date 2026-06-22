import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../core/components/Button';
import { PhoneField } from '../../../core/components/PhoneField';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { isValidPhone } from '../../auth';
import {
  getAdminWhatsappNumber,
  getSupportWhatsappNumber,
  setAdminWhatsappNumber,
  setSupportWhatsappNumber,
} from '../../settings';
import { ADMIN_NS } from '../constants';

const DEFAULT_NUMBER = '+222';

// Admin-only panel to edit the two app-wide WhatsApp numbers (orders + support).
export function AdminSettings() {
  const { t } = useTranslation(ADMIN_NS);
  const rtl = useIsRTL();

  const [orders, setOrders] = useState(DEFAULT_NUMBER);
  const [support, setSupport] = useState(DEFAULT_NUMBER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [o, s] = await Promise.all([
          getAdminWhatsappNumber(),
          getSupportWhatsappNumber(),
        ]);
        if (!active) return;
        if (o) setOrders(o);
        if (s) setSupport(s);
      } catch {
        if (active) setError(t('settings.saveFailed'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [t]);

  const onSave = async () => {
    if (!isValidPhone(orders) || !isValidPhone(support)) {
      setError(t('settings.invalid'));
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await Promise.all([
        setAdminWhatsappNumber(orders),
        setSupportWhatsappNumber(support),
      ]);
      setSaved(true);
    } catch {
      setError(t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator color={colors.primary} style={styles.center} />;
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, rtl && rtlTextStyle]}>{t('settings.title')}</Text>
      <Text style={[styles.subtitle, rtl && rtlTextStyle]}>{t('settings.subtitle')}</Text>

      <PhoneField
        label={t('settings.ordersLabel')}
        value={orders}
        onChangeText={(v) => {
          setOrders(v);
          setSaved(false);
        }}
      />
      <Text style={[styles.hint, rtl && rtlTextStyle]}>{t('settings.ordersHint')}</Text>

      <PhoneField
        label={t('settings.supportLabel')}
        value={support}
        onChangeText={(v) => {
          setSupport(v);
          setSaved(false);
        }}
      />
      <Text style={[styles.hint, rtl && rtlTextStyle]}>{t('settings.supportHint')}</Text>

      {!!error && <Text style={[styles.error, rtl && rtlTextStyle]}>{error}</Text>}
      {saved && <Text style={[styles.saved, rtl && rtlTextStyle]}>{t('settings.saved')}</Text>}

      <Button
        label={saving ? t('settings.saving') : t('settings.save')}
        onPress={onSave}
        loading={saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    marginTop: spacing.xl,
  },
  content: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  hint: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
  saved: {
    color: colors.success,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
});
