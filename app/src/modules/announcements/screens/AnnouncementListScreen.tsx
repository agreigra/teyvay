import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { LanguageSwitcher } from '../../../core/components/LanguageSwitcher';
import { Screen } from '../../../core/components/Screen';
import { colors, spacing, typography } from '../../../core/theme';
import { AUTH_NS, useAuth } from '../../auth';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { ANNOUNCEMENTS_NS } from '../constants';
import { useAnnouncements } from '../hooks/useAnnouncements';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'List'>;

export function AnnouncementListScreen({ navigation }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const { session, profile, signOut, openAuth } = useAuth();
  const role = profile?.role;
  const isMerchant = role === 'merchant';
  const isGuest = !session;

  const scope = isMerchant ? 'mine' : role === 'admin' ? 'all' : 'active';
  const { items, loading, error, reload } = useAnnouncements(scope, profile?.id);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            {isMerchant ? t('list.myTitle') : t('list.browseTitle')}
          </Text>
          {isGuest ? (
            <Pressable onPress={openAuth} hitSlop={8}>
              <Text style={styles.signOut}>{t('signIn.submit', { ns: AUTH_NS })}</Text>
            </Pressable>
          ) : (
            <Pressable onPress={signOut} hitSlop={8}>
              <Text style={styles.signOut}>{t('signOut', { ns: AUTH_NS })}</Text>
            </Pressable>
          )}
        </View>
        <LanguageSwitcher />
      </View>

      {isMerchant && (
        <Button
          label={t('list.create')}
          onPress={() => navigation.navigate('Create')}
          style={styles.createBtn}
        />
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
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnnouncementCard
              item={item}
              showStatus={isMerchant || role === 'admin'}
              onPress={() => navigation.navigate('Detail', { id: item.id })}
            />
          )}
          contentContainerStyle={items.length === 0 && styles.center}
          ListEmptyComponent={
            <Text style={styles.muted}>
              {isMerchant ? t('list.emptyMine') : t('list.empty')}
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  signOut: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  createBtn: {
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
