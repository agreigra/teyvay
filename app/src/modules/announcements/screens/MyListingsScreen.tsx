import { useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { useAuth } from '../../auth';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { GradientHeader } from '../components/GradientHeader';
import { StatusFilter, StatusFilterValue } from '../components/StatusFilter';
import { ANNOUNCEMENTS_NS } from '../constants';
import { useAnnouncements } from '../hooks/useAnnouncements';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'MyList'>;

// A merchant's own listings (any status) with create + status filter. Tapping a
// listing opens it in manage mode (edit / change status).
export function MyListingsScreen({ navigation }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const { profile } = useAuth();
  const rtl = useIsRTL();

  const { items, loading, error, reload } = useAnnouncements('mine', profile?.id);

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const visibleItems = useMemo(
    () => (statusFilter === 'all' ? items : items.filter((i) => i.status === statusFilter)),
    [statusFilter, items],
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('list.myTitle') });
  }, [navigation, t]);

  const header = (
    <>
      <GradientHeader
        icon="package"
        title={t('list.myTitle')}
        subtitle={t('list.countLabel', { n: items.length })}
      >
        <Pressable
          style={[styles.addBtn, rtl && styles.rowRev]}
          onPress={() => navigation.navigate('Create')}
        >
          <Feather name="plus" size={18} color={colors.primary} />
          <Text style={styles.addBtnText}>{t('list.create')}</Text>
        </Pressable>
      </GradientHeader>

      <View style={[styles.banner, rtl && styles.rowRev]}>
        <Feather name="refresh-cw" size={16} color={colors.textMuted} />
        <Text style={[styles.bannerText, rtl && rtlTextStyle]}>{t('list.editNote')}</Text>
      </View>

      <StatusFilter value={statusFilter} onChange={setStatusFilter} />
    </>
  );

  const empty = (
    <View style={styles.emptyBox}>
      <Feather name="package" size={40} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, rtl && rtlTextStyle]}>
        {statusFilter === 'all' ? t('list.emptyMine') : t('list.emptyFiltered')}
      </Text>
      {statusFilter === 'all' && (
        <Button
          label={t('list.create')}
          icon="plus"
          onPress={() => navigation.navigate('Create')}
          style={styles.emptyBtn}
        />
      )}
    </View>
  );

  return (
    <Screen underHeader>
      {loading && items.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.center} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.muted}>{t('errors.loadFailed')}</Text>
          <Pressable onPress={reload} hitSlop={8}>
            <Text style={styles.retry}>{t('common.retry', { ns: 'core' })}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <AnnouncementCard
              item={item}
              showStatus
              onPress={() => navigation.navigate('Detail', { id: item.id, manage: true })}
            />
          )}
          ListEmptyComponent={empty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.lg,
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: typography.body,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  retry: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
