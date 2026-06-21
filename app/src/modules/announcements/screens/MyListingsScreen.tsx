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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { Screen } from '../../../core/components/Screen';
import { colors, spacing, typography } from '../../../core/theme';
import { useAuth } from '../../auth';
import { AnnouncementCard } from '../components/AnnouncementCard';
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

  const { items, loading, error, reload } = useAnnouncements('mine', profile?.id);

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const visibleItems = useMemo(
    () => (statusFilter === 'all' ? items : items.filter((i) => i.status === statusFilter)),
    [statusFilter, items],
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('list.myTitle') });
  }, [navigation, t]);

  return (
    <Screen>
      <Button
        label={t('list.create')}
        onPress={() => navigation.navigate('Create')}
        style={styles.createBtn}
      />
      <StatusFilter value={statusFilter} onChange={setStatusFilter} />

      {loading && visibleItems.length === 0 ? (
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
          contentContainerStyle={visibleItems.length === 0 && styles.center}
          ListEmptyComponent={
            <Text style={styles.muted}>
              {statusFilter === 'all' ? t('list.emptyMine') : t('list.emptyFiltered')}
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
