import { useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'List'>;

export function AnnouncementListScreen({ navigation }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const { profile } = useAuth();
  const role = profile?.role;
  const isMerchant = role === 'merchant';

  const scope = isMerchant ? 'mine' : role === 'admin' ? 'all' : 'active';
  const { items, loading, error, reload } = useAnnouncements(scope, profile?.id);

  // Merchants can filter their own listings by status.
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const visibleItems = useMemo(
    () =>
      isMerchant && statusFilter !== 'all'
        ? items.filter((i) => i.status === statusFilter)
        : items,
    [isMerchant, statusFilter, items],
  );

  // Set the shared AppBar title for this screen.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isMerchant ? t('list.myTitle') : t('list.browseTitle'),
    });
  }, [navigation, isMerchant, t]);

  return (
    <Screen>
      {isMerchant && (
        <>
          <Button
            label={t('list.create')}
            onPress={() => navigation.navigate('Create')}
            style={styles.createBtn}
          />
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </>
      )}

      {loading ? (
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
          renderItem={({ item }) => (
            <AnnouncementCard
              item={item}
              showStatus={isMerchant || role === 'admin'}
              onPress={() => navigation.navigate('Detail', { id: item.id })}
            />
          )}
          contentContainerStyle={visibleItems.length === 0 && styles.center}
          ListEmptyComponent={
            <Text style={styles.muted}>
              {isMerchant
                ? statusFilter === 'all'
                  ? t('list.emptyMine')
                  : t('list.emptyFiltered')
                : t('list.empty')}
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
