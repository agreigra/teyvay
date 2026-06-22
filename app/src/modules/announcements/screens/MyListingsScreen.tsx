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

import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, spacing, typography } from '../../../core/theme';
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
        subtitle={t('list.countLabel', { count: items.length })}
      >
        <Pressable
          style={[styles.addBtn, rtl && styles.rowRev]}
          onPress={() => navigation.navigate('Create')}
        >
          <Feather name="plus" size={18} color={colors.primary} />
          <Text style={styles.addBtnText}>{t('list.create')}</Text>
        </Pressable>
      </GradientHeader>

      <StatusFilter value={statusFilter} onChange={setStatusFilter} />
    </>
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
          ListEmptyComponent={
            <Text style={[styles.muted, styles.empty]}>
              {statusFilter === 'all' ? t('list.emptyMine') : t('list.emptyFiltered')}
            </Text>
          }
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
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
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
