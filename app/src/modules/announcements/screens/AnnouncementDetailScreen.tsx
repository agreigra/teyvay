import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { formatPrice } from '../../../core/utils/format';
import { openWhatsapp } from '../../../core/utils/whatsapp';
import type { Announcement, AnnouncementStatus } from '../../../core/types/database';
import { useAuth } from '../../auth';
import { getAdminWhatsappNumber } from '../../settings';
import { ANNOUNCEMENTS_NS } from '../constants';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';
import { getById, setStatus } from '../services/announcements.service';
import { localizedDescription, localizedTitle } from '../utils';

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'Detail'>;

export function AnnouncementDetailScreen({ route, navigation }: Props) {
  const { id, manage } = route.params;
  const { t, i18n } = useTranslation(ANNOUNCEMENTS_NS);
  const { profile } = useAuth();
  const rtl = useIsRTL();

  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Refetch on focus so edits made on the Edit screen are reflected on return.
  useFocusEffect(
    useCallback(() => {
      getById(id)
        .then(setItem)
        .finally(() => setLoading(false));
    }, [id]),
  );

  const isOwner = !!item && item.created_by === profile?.id;
  const isAdmin = profile?.role === 'admin';
  // Management (edit / status) is shown only when arriving from the merchant's
  // "My listings" or the admin dashboard (manage=true). The public browse always
  // shows the contact view, even for merchants/admins.
  const canManage = !!manage && (isOwner || isAdmin);
  const isPending = item?.status === 'pending';
  const isRejected = item?.status === 'rejected';
  // Editable while active or awaiting/declined validation (not once sold/closed).
  const canEdit = canManage && (item?.status === 'active' || isPending || isRejected);

  const onContact = async () => {
    if (!item) return;
    const number = await getAdminWhatsappNumber();
    if (!number) {
      Alert.alert(t('errors.noWhatsapp'));
      return;
    }
    const message = t('detail.interest', { title: item.title, id: item.id });
    await openWhatsapp(number, message);
  };

  const changeStatus = async (status: AnnouncementStatus) => {
    if (!item) return;
    setBusy(true);
    try {
      await setStatus(item.id, status);
      setItem({ ...item, status });
    } catch {
      Alert.alert(t('errors.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Screen underHeader>
        <ActivityIndicator color={colors.primary} style={styles.center} />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen underHeader>
        <Text style={styles.muted}>{t('errors.loadFailed')}</Text>
      </Screen>
    );
  }

  return (
    <Screen underHeader>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{t(`status.${item.status}`)}</Text>
      </View>

      <Text style={[styles.title, rtl && rtlTextStyle]}>
        {localizedTitle(item, i18n.language)}
      </Text>
      <View style={[styles.priceRow, rtl && styles.rowRev]}>
        <Text style={[styles.price, rtl && rtlTextStyle]}>{formatPrice(item.price)}</Text>
        {item.quantity != null && (
          <Text style={styles.quantity}>{t('detail.quantity', { n: item.quantity })}</Text>
        )}
      </View>
      {!!localizedDescription(item, i18n.language) && (
        <Text style={[styles.description, rtl && rtlTextStyle]}>
          {localizedDescription(item, i18n.language)}
        </Text>
      )}

      <View style={styles.spacer} />

      {canManage ? (
        <View style={styles.actions}>
          {(isPending || isRejected) && (
            <View style={[styles.note, isRejected ? styles.noteDanger : styles.notePending]}>
              <Text style={[styles.noteText, rtl && rtlTextStyle]}>
                {isRejected ? t('detail.rejectedNote') : t('detail.pendingNote')}
              </Text>
            </View>
          )}

          {canEdit && (
            <Button
              label={t('detail.edit')}
              onPress={() => navigation.navigate('Edit', { id: item.id })}
              variant="outline"
              disabled={busy}
            />
          )}

          {/* Admin validation of a not-yet-approved listing */}
          {isAdmin && (isPending || isRejected) && (
            <>
              <Button label={t('detail.approve')} onPress={() => changeStatus('active')} loading={busy} />
              {!isRejected && (
                <Button
                  label={t('detail.reject')}
                  onPress={() => changeStatus('rejected')}
                  loading={busy}
                  variant="outline"
                />
              )}
            </>
          )}

          {/* Owner can resubmit a rejected listing for review */}
          {isOwner && !isAdmin && isRejected && (
            <Button label={t('detail.resubmit')} onPress={() => changeStatus('pending')} loading={busy} />
          )}

          {/* Standard transitions once a listing has been approved */}
          {!isPending && !isRejected && (
            <>
              {item.status !== 'active' && (
                <Button label={t('detail.markActive')} onPress={() => changeStatus('active')} loading={busy} />
              )}
              {item.status !== 'sold' && (
                <Button
                  label={t('detail.markSold')}
                  onPress={() => changeStatus('sold')}
                  loading={busy}
                  variant="outline"
                />
              )}
              {item.status !== 'inactive' && (
                <Button
                  label={t('detail.markInactive')}
                  onPress={() => changeStatus('inactive')}
                  loading={busy}
                  variant="outline"
                />
              )}
            </>
          )}
        </View>
      ) : (
        <Button label={t('detail.contact')} onPress={onContact} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  note: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  notePending: {
    backgroundColor: 'rgba(217,119,6,0.10)',
  },
  noteDanger: {
    backgroundColor: 'rgba(220,38,38,0.10)',
  },
  noteText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  price: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.primary,
  },
  quantity: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textMuted,
  },
  description: {
    fontSize: typography.body,
    color: colors.text,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
});
