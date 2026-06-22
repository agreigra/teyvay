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

import { AUTH_NS } from '../../modules/auth/constants';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { getAdminWhatsappNumber } from '../../modules/settings';
import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';
import { openWhatsapp } from '../utils/whatsapp';
import type { AppMenuParamList } from './AppMenuStack';

// The menu is mounted in both the main shell and the auth stack, which expose
// different route sets, so navigation is typed loosely here.
type Props = { navigation: any };

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
  const { session, profile, signOut, openAuth, closeAuth } = useAuth();
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
  // The main shell exposes the section routes; the auth stack does not.
  const inMain = (navState.routeNames as string[]).includes('Announcements');

  const resetTo = (name: keyof AppMenuParamList) =>
    navigation.reset({ index: 0, routes: [{ name }] });

  // From the auth stack, "Home" means: leave the auth flow and browse.
  const goHome = () => {
    if (inMain) resetTo('Announcements');
    else {
      close();
      closeAuth();
    }
  };

  const goAuth = (route: 'SignIn' | 'Register') => {
    close();
    if ((navState.routeNames as string[]).includes(route)) navigation.navigate(route);
    else openAuth(route);
  };

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
      onPress: goHome,
      active: inMain && activeName === 'Announcements',
    },
  ];
  if (inMain && isMerchant) {
    rows.push(
      { key: 'add', label: t('menu.addProduct'), icon: 'plus-square', onPress: () => openAnnouncements('Create') },
      { key: 'mine', label: t('menu.myProducts'), icon: 'package', onPress: () => openAnnouncements('MyList') },
    );
  }
  if (inMain && isAdmin) {
    rows.push({
      key: 'admin',
      label: t('menu.admin'),
      icon: 'shield',
      onPress: () => resetTo('Admin'),
      active: activeName === 'Admin',
    });
  }
  if (inMain) {
    rows.push({
      key: 'about',
      label: t('menu.about'),
      icon: 'info',
      onPress: () => resetTo('About'),
      active: activeName === 'About',
    });
  }
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
              onPress={() => goAuth('SignIn')}
            >
              <Text style={styles.authPrimaryText}>{t('menu.signIn')}</Text>
            </Pressable>
            <Pressable
              style={[styles.authBtn, styles.authOutline]}
              onPress={() => goAuth('Register')}
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
