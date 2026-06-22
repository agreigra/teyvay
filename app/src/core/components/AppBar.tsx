import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { AUTH_NS } from '../../modules/auth/constants';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { AppLanguage, SUPPORTED_LANGUAGES, changeAppLanguage, useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';

const BAR_HEIGHT = 56;

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Shared top app bar used on every page (incl. the auth screens) for a
// consistent layout. Left: hamburger (top-level) or back arrow. Right: language
// switcher + user menu.
export function AppBar({ navigation, options, back }: NativeStackHeaderProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const rtl = useIsRTL();
  const { session, profile, signOut, openAuth } = useAuth();
  const [open, setOpen] = useState<'lang' | 'user' | null>(null);

  const title = options.title ?? '';

  // Context-aware navigation: the same bar is used on the main shell and the
  // auth stack, which expose different routes.
  const routeNames = navigation.getState().routeNames as string[];
  const has = (name: string) => routeNames.includes(name);

  const selectLang = (lang: AppLanguage) => {
    setOpen(null);
    changeAppLanguage(lang);
  };

  const goAuth = (route: 'SignIn' | 'Register') => {
    setOpen(null);
    if (has(route)) navigation.navigate(route as never);
    else openAuth(route);
  };

  const name =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    '';
  const initials = initialsOf(name);
  const langCode = (i18n.language || 'ar').slice(0, 2).toUpperCase();
  const backIcon = rtl ? 'chevron-right' : 'chevron-left';

  return (
    <View
      style={[
        styles.bar,
        rtl && styles.barRtl,
        { paddingTop: insets.top, height: BAR_HEIGHT + insets.top },
      ]}
    >
      <Pressable
        hitSlop={8}
        onPress={() => (back ? navigation.goBack() : has('Menu') && navigation.navigate('Menu' as never))}
        style={styles.squareBtn}
      >
        <Feather name={back ? backIcon : 'menu'} size={20} color={colors.surface} />
      </Pressable>

      <Text style={[styles.title, rtl && rtlTextStyle]} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.right, rtl && styles.rightRtl]}>
        <Pressable hitSlop={6} onPress={() => setOpen('lang')} style={[styles.langPill, rtl && styles.rowRev]}>
          <Feather name="globe" size={14} color={colors.surface} />
          <Text style={styles.langText}>{langCode}</Text>
        </Pressable>

        <Pressable hitSlop={6} onPress={() => setOpen('user')}>
          {session && initials ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          ) : (
            <View style={styles.squareBtn}>
              <Feather name="user" size={18} color={colors.surface} />
            </View>
          )}
        </Pressable>
      </View>

      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)}>
          <View
            style={[
              styles.menu,
              { top: insets.top + BAR_HEIGHT - spacing.sm, [rtl ? 'left' : 'right']: spacing.sm },
            ]}
          >
            {open === 'lang' &&
              SUPPORTED_LANGUAGES.map((lang) => {
                const active = lang === i18n.language;
                return (
                  <Pressable key={lang} style={styles.row} onPress={() => selectLang(lang)}>
                    <Text style={[styles.rowText, active && styles.primary, rtl && rtlTextStyle]}>
                      {t(`languages.${lang}`)}
                    </Text>
                  </Pressable>
                );
              })}

            {open === 'user' && session && (
              <>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowInfoText, rtl && rtlTextStyle]}>{name || profile?.phone || ''}</Text>
                  {!!profile && (
                    <Text style={[styles.rowInfoSub, rtl && rtlTextStyle]}>
                      {t(`roleName.${profile.role}`, { ns: AUTH_NS })}
                    </Text>
                  )}
                </View>
                {has('Profile') && (
                  <Pressable
                    style={styles.row}
                    onPress={() => {
                      setOpen(null);
                      navigation.navigate('Profile' as never);
                    }}
                  >
                    <Text style={[styles.rowText, rtl && rtlTextStyle]}>{t('menu.profile')}</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setOpen(null);
                    signOut();
                  }}
                >
                  <Text style={[styles.rowText, rtl && rtlTextStyle]}>{t('menu.signOut')}</Text>
                </Pressable>
              </>
            )}

            {open === 'user' && !session && (
              <>
                <Pressable style={styles.row} onPress={() => goAuth('SignIn')}>
                  <Text style={[styles.rowText, styles.primary, rtl && rtlTextStyle]}>{t('menu.signIn')}</Text>
                </Pressable>
                <Pressable style={styles.row} onPress={() => goAuth('Register')}>
                  <Text style={[styles.rowText, rtl && rtlTextStyle]}>{t('menu.signUp')}</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const TRANSLUCENT = 'rgba(255,255,255,0.18)';

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  barRtl: {
    flexDirection: 'row-reverse',
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  squareBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: TRANSLUCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.surface,
    marginHorizontal: spacing.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // In RTL the user avatar sits on the left (before the language switcher).
  rightRtl: {
    flexDirection: 'row-reverse',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 38,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: TRANSLUCENT,
  },
  langText: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: typography.caption,
    letterSpacing: 0.5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: typography.caption,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    minWidth: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rowText: {
    fontSize: typography.body,
    color: colors.text,
  },
  primary: {
    color: colors.primary,
    fontWeight: '700',
  },
  rowInfo: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowInfoText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  rowInfoSub: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
});
