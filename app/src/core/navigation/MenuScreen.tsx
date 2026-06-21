import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AUTH_NS, useAuth } from '../../modules/auth';
import { getAdminWhatsappNumber } from '../../modules/settings';
import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';
import { openWhatsapp } from '../utils/whatsapp';
import type { AppMenuParamList } from './AppMenuStack';

type Props = NativeStackScreenProps<AppMenuParamList, 'Menu'>;

type FeatherName = keyof typeof Feather.glyphMap;

const PANEL_WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);

type Row = {
  key: string;
  label: string;
  icon: FeatherName;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
};

// Slide-in menu presented as a transparent modal. Uses RN's built-in Animated
// (no Reanimated), so it runs everywhere including Expo Go.
export function MenuScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { session, profile, signOut, openAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const rtl = useIsRTL();

  const slide = useRef(new Animated.Value(rtl ? PANEL_WIDTH : -PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slide]);

  const close = () => navigation.goBack();

  // The section sitting just under the Menu modal is the active one.
  const navState = navigation.getState();
  const activeName = navState.routes[navState.index - 1]?.name;

  const resetTo = (name: keyof AppMenuParamList) =>
    navigation.reset({ index: 0, routes: [{ name }] });

  const openAnnouncements = (screen: 'Create' | 'MyList') =>
    navigation.reset({
      index: 0,
      routes: [
        { name: 'Announcements', state: { index: 1, routes: [{ name: 'List' }, { name: screen }] } },
      ],
    } as never);

  const contactSupport = async () => {
    const number = await getAdminWhatsappNumber();
    if (!number) {
      Alert.alert(t('app.name'), t('menu.supportUnavailable'));
      return;
    }
    close();
    await openWhatsapp(number, t('menu.supportMessage'));
  };

  const isMerchant = profile?.role === 'merchant';
  const isAdmin = profile?.role === 'admin';

  const rows: Row[] = [
    {
      key: 'home',
      label: t('menu.home'),
      icon: 'home',
      onPress: () => resetTo('Announcements'),
      active: activeName === 'Announcements',
    },
  ];
  if (isMerchant) {
    rows.push(
      { key: 'add', label: t('menu.addProduct'), icon: 'plus-square', onPress: () => openAnnouncements('Create') },
      { key: 'mine', label: t('menu.myProducts'), icon: 'package', onPress: () => openAnnouncements('MyList') },
    );
  }
  if (isAdmin) {
    rows.push({
      key: 'admin',
      label: t('menu.admin'),
      icon: 'shield',
      onPress: () => resetTo('Admin'),
      active: activeName === 'Admin',
    });
  }
  rows.push({
    key: 'about',
    label: t('menu.about'),
    icon: 'info',
    onPress: () => resetTo('About'),
    active: activeName === 'About',
  });
  rows.push({ key: 'support', label: t('menu.support'), icon: 'headphones', onPress: contactSupport });
  if (session) {
    rows.push({ key: 'signout', label: t('menu.signOut'), icon: 'log-out', onPress: signOut, danger: true });
  }

  const userName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.phone ||
    '';

  return (
    <View style={[styles.root, rtl && styles.rootRtl]}>
      <Pressable style={styles.backdrop} onPress={close} />
      <Animated.View
        style={[
          styles.panel,
          { paddingTop: insets.top + spacing.md, transform: [{ translateX: slide }] },
        ]}
      >
        {/* Header: brand + close */}
        <View style={[styles.headerRow, rtl && styles.rowRev]}>
          <View style={[styles.brandRow, rtl && styles.rowRev]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarMark}>∧</Text>
            </View>
            <View style={styles.brandText}>
              <Text style={[styles.appName, rtl && rtlTextStyle]}>{t('app.name')}</Text>
              <Text style={[styles.appTagline, rtl && rtlTextStyle]} numberOfLines={1}>
                {t('app.tagline')}
              </Text>
            </View>
          </View>
          <Pressable hitSlop={8} onPress={close} style={styles.closeBtn}>
            <Feather name="x" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* User card / sign-in prompt */}
        {session ? (
          <Pressable
            style={[styles.userCard, rtl && styles.rowRev]}
            onPress={() => resetTo('Profile')}
          >
            <View style={styles.userIcon}>
              <Feather name="user" size={20} color={colors.primary} />
            </View>
            <View style={styles.userText}>
              <Text style={[styles.userName, rtl && rtlTextStyle]} numberOfLines={1}>
                {userName}
              </Text>
              {!!profile?.phone && (
                <Text style={[styles.userPhone, rtl && rtlTextStyle]} numberOfLines={1}>
                  {profile.phone}
                </Text>
              )}
            </View>
          </Pressable>
        ) : (
          <View style={[styles.authRow, rtl && styles.rowRev]}>
            <Pressable
              style={[styles.authBtn, styles.authPrimary]}
              onPress={() => {
                close();
                openAuth('SignIn');
              }}
            >
              <Text style={styles.authPrimaryText}>{t('menu.signIn')}</Text>
            </Pressable>
            <Pressable
              style={[styles.authBtn, styles.authOutline]}
              onPress={() => {
                close();
                openAuth('Register');
              }}
            >
              <Text style={styles.authOutlineText}>{t('menu.signUp')}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.divider} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.items}>
          {rows.map((r) => {
            const tint = r.danger ? colors.danger : r.active ? colors.primary : colors.text;
            return (
              <Pressable
                key={r.key}
                onPress={r.onPress}
                style={[styles.item, rtl && styles.rowRev, r.active && styles.itemActive]}
              >
                <Feather name={r.icon} size={20} color={tint} />
                <Text
                  style={[
                    styles.itemText,
                    rtl && rtlTextStyle,
                    { color: tint },
                    (r.active || r.danger) && styles.itemTextStrong,
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  rootRtl: {
    flexDirection: 'row-reverse',
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMark: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  brandText: {
    flexShrink: 1,
  },
  appName: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  appTagline: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  userIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  userPhone: {
    fontSize: typography.caption,
    color: colors.primary,
    opacity: 0.8,
    marginTop: 2,
  },
  authRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  authBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  authPrimary: {
    backgroundColor: colors.primary,
  },
  authPrimaryText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: typography.body,
  },
  authOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  authOutlineText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: typography.body,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  items: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  itemActive: {
    backgroundColor: colors.primarySoft,
  },
  itemText: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
  },
  itemTextStrong: {
    fontWeight: '700',
  },
});
