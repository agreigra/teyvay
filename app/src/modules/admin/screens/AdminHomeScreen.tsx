import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import type { Profile, UserRole } from '../../../core/types/database';
import { AnnouncementCard, useAnnouncements } from '../../announcements';
import { UserRow } from '../components/UserRow';
import { ADMIN_NS } from '../constants';
import { useProfiles } from '../hooks/useProfiles';
import { setUserDeleted, setUserRole } from '../services/admin.service';
import { useAuth } from '../../auth';

type Tab = 'listings' | 'users';

export function AdminHomeScreen() {
  const { t } = useTranslation(ADMIN_NS);
  const rtl = useIsRTL();
  const navigation = useNavigation<any>();
  const { profile: me } = useAuth();

  const [tab, setTab] = useState<Tab>('listings');
  const [filterUser, setFilterUser] = useState<Profile | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const listScope = filterUser ? 'mine' : 'all';
  const listings = useAnnouncements(listScope, filterUser?.id);
  const users = useProfiles();

  const changeRole = async (user: Profile, role: UserRole) => {
    setBusyUserId(user.id);
    try {
      await setUserRole(user.id, role);
      users.reload();
    } catch {
      // swallow; reload reflects the unchanged state
    } finally {
      setBusyUserId(null);
    }
  };

  const toggleBan = async (user: Profile, deleted: boolean) => {
    setBusyUserId(user.id);
    try {
      await setUserDeleted(user.id, deleted);
      users.reload();
    } catch {
      // swallow; reload reflects the unchanged state
    } finally {
      setBusyUserId(null);
    }
  };

  const viewUserListings = (user: Profile) => {
    setFilterUser(user);
    setTab('listings');
  };

  const filterLabel = filterUser?.display_name || filterUser?.phone || '';

  return (
    <Screen>
      <View style={[styles.tabs, rtl && styles.rowRtl]}>
        {(['listings', 'users'] as Tab[]).map((key) => {
          const active = key === tab;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t(`tabs.${key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'listings' ? (
        <>
          {filterUser && (
            <View style={[styles.filterBar, rtl && styles.rowRtl]}>
              <Text style={[styles.filterText, rtl && rtlTextStyle]} numberOfLines={1}>
                {t('listings.filteredBy', { name: filterLabel })}
              </Text>
              <Pressable onPress={() => setFilterUser(null)} hitSlop={6}>
                <Text style={styles.filterClear}>{t('listings.clear')}</Text>
              </Pressable>
            </View>
          )}

          {listings.loading ? (
            <ActivityIndicator color={colors.primary} style={styles.center} />
          ) : listings.error ? (
            <View style={styles.center}>
              <Text style={[styles.muted, rtl && rtlTextStyle]}>{t('errors.loadFailed')}</Text>
              <Pressable onPress={listings.reload} hitSlop={8}>
                <Text style={styles.retry}>{t('common.retry', { ns: 'core' })}</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={listings.items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AnnouncementCard
                  item={item}
                  showStatus
                  onPress={() =>
                    navigation.navigate('Announcements', {
                      screen: 'Detail',
                      params: { id: item.id },
                    })
                  }
                />
              )}
              contentContainerStyle={listings.items.length === 0 && styles.center}
              ListEmptyComponent={
                <Text style={[styles.muted, rtl && rtlTextStyle]}>{t('listings.empty')}</Text>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : users.loading ? (
        <ActivityIndicator color={colors.primary} style={styles.center} />
      ) : users.error ? (
        <View style={styles.center}>
          <Text style={[styles.muted, rtl && rtlTextStyle]}>{t('errors.loadFailed')}</Text>
          <Pressable onPress={users.reload} hitSlop={8}>
            <Text style={styles.retry}>{t('common.retry', { ns: 'core' })}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={users.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserRow
              item={item}
              busy={busyUserId === item.id}
              isSelf={item.id === me?.id}
              onChangeRole={(role) => changeRole(item, role)}
              onToggleBan={(deleted) => toggleBan(item, deleted)}
              onViewListings={() => viewUserListings(item)}
            />
          )}
          contentContainerStyle={users.items.length === 0 && styles.center}
          ListEmptyComponent={
            <Text style={[styles.muted, rtl && rtlTextStyle]}>{t('users.empty')}</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: colors.surface,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  filterText: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.text,
  },
  filterClear: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.primary,
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
