import { useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { getSupportWhatsappNumber } from '../../settings';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { openWhatsapp } from '../../../core/utils/whatsapp';
import { useAuth } from '../../auth';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { HomeHero } from '../components/HomeHero';
import { SearchBar } from '../components/SearchBar';
import { ANNOUNCEMENTS_NS } from '../constants';
import { useAnnouncements } from '../hooks/useAnnouncements';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'List'>;

export function AnnouncementListScreen({ navigation }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const { profile } = useAuth();
  const rtl = useIsRTL();
  const isMerchant = profile?.role === 'merchant';

  const { items, loading, error, reload } = useAnnouncements('active');
  const [query, setQuery] = useState('');

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q),
    );
  }, [query, items]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('list.browseTitle') });
  }, [navigation, t]);

  const userName =
    profile?.first_name ||
    profile?.display_name?.split(' ')[0] ||
    undefined;

  const openSupport = async () => {
    const number = await getSupportWhatsappNumber();
    if (!number) {
      Alert.alert(t('app.name', { ns: 'core' }), t('menu.supportUnavailable', { ns: 'core' }));
      return;
    }
    await openWhatsapp(number, t('menu.supportMessage', { ns: 'core' }));
  };

  const header = (
    <>
      <HomeHero
        count={items.length}
        isMerchant={isMerchant}
        userName={userName}
        onAddProduct={() => navigation.navigate('Create')}
      />
      <SearchBar value={query} onChangeText={setQuery} />

      <View style={[styles.sectionRow, rtl && styles.rowRev]}>
        <Text style={[styles.count, rtl && rtlTextStyle]}>
          {t('list.countLabel', { n: visibleItems.length })}
        </Text>
        <View style={[styles.links, rtl && styles.rowRev]}>
          <Pressable
            style={[styles.link, rtl && styles.rowRev]}
            onPress={() => navigation.getParent()?.navigate('About' as never)}
          >
            <Feather name="info" size={14} color={colors.textMuted} />
            <Text style={styles.linkText}>{t('menu.about', { ns: 'core' })}</Text>
          </Pressable>
          <Pressable style={[styles.link, rtl && styles.rowRev]} onPress={openSupport}>
            <Feather name="headphones" size={14} color={colors.textMuted} />
            <Text style={styles.linkText}>{t('menu.support', { ns: 'core' })}</Text>
          </Pressable>
        </View>
      </View>
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
              onPress={() => navigation.navigate('Detail', { id: item.id })}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.muted, styles.empty]}>
              {query ? t('list.emptySearch') : t('list.empty')}
            </Text>
          }
          ListFooterComponent={
            <Text style={styles.footer}>{t('list.footer', { year: 2026 })}</Text>
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
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  count: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  links: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
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
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.lg,
  },
});
