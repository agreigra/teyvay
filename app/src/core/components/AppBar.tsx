import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { AUTH_NS, useAuth } from '../../modules/auth';
import { AppLanguage, SUPPORTED_LANGUAGES, changeAppLanguage, useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';

const BAR_HEIGHT = 56;

// Shared top app bar used on every page for a consistent layout.
// Left: hamburger (top-level) or back arrow (pushed screens).
// Right: language dropdown + user dropdown (login/logout).
export function AppBar({ navigation, options, back }: NativeStackHeaderProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const rtl = useIsRTL();
  const { session, profile, signOut, openAuth } = useAuth();
  const [open, setOpen] = useState<'lang' | 'user' | null>(null);

  const title = options.title ?? '';

  const selectLang = (lang: AppLanguage) => {
    setOpen(null);
    changeAppLanguage(lang);
  };

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
        onPress={() => (back ? navigation.goBack() : navigation.navigate('Menu' as never))}
        style={styles.iconBtn}
      >
        <Text style={styles.icon}>{back ? '‹' : '☰'}</Text>
      </Pressable>

      <Text style={[styles.title, rtl && rtlTextStyle]} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.right, rtl && styles.rightRtl]}>
        <Pressable hitSlop={8} onPress={() => setOpen('lang')} style={styles.iconBtn}>
          <Text style={styles.icon}>🌐</Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={() => setOpen('user')} style={styles.iconBtn}>
          <Text style={styles.icon}>👤</Text>
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
                  <Text style={[styles.rowInfoText, rtl && rtlTextStyle]}>{profile?.phone ?? ''}</Text>
                  {!!profile && (
                    <Text style={[styles.rowInfoSub, rtl && rtlTextStyle]}>
                      {t(`roleName.${profile.role}`, { ns: AUTH_NS })}
                    </Text>
                  )}
                </View>
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setOpen(null);
                    navigation.navigate('Profile' as never);
                  }}
                >
                  <Text style={[styles.rowText, rtl && rtlTextStyle]}>{t('menu.profile')}</Text>
                </Pressable>
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
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setOpen(null);
                    openAuth('SignIn');
                  }}
                >
                  <Text style={[styles.rowText, styles.primary, rtl && rtlTextStyle]}>{t('menu.signIn')}</Text>
                </Pressable>
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setOpen(null);
                    openAuth('Register');
                  }}
                >
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

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  barRtl: {
    flexDirection: 'row-reverse',
  },
  iconBtn: {
    padding: spacing.xs,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    color: colors.surface,
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
    gap: spacing.md,
  },
  // In RTL the user icon sits on the left (before the language switcher).
  rightRtl: {
    flexDirection: 'row-reverse',
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
    // subtle elevation
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
