import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AUTH_NS, useAuth } from '../../modules/auth';
import { getAdminWhatsappNumber } from '../../modules/settings';
import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';
import { openWhatsapp } from '../utils/whatsapp';
import type { AppMenuParamList } from './AppMenuStack';

type Props = NativeStackScreenProps<AppMenuParamList, 'Menu'>;

const PANEL_WIDTH = Math.min(320, Dimensions.get('window').width * 0.82);

// Slide-in menu presented as a transparent modal. Uses RN's built-in Animated
// (no Reanimated), so it runs everywhere including Expo Go.
export function MenuScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const rtl = useIsRTL();
  // Slide in from the menu's side: left for LTR, right for RTL.
  const slide = useRef(new Animated.Value(rtl ? PANEL_WIDTH : -PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slide]);

  const close = () => navigation.goBack();

  const goSection = (name: keyof AppMenuParamList) => {
    navigation.reset({ index: 0, routes: [{ name }] });
  };

  const contactSupport = async () => {
    const number = await getAdminWhatsappNumber();
    if (!number) {
      Alert.alert(t('app.name'), t('menu.supportUnavailable'));
      return;
    }
    close();
    await openWhatsapp(number, t('menu.supportMessage'));
  };

  const items: { name: keyof AppMenuParamList; label: string }[] = [
    { name: 'Announcements', label: t('menu.announcements') },
  ];
  if (session) items.push({ name: 'Profile', label: t('menu.profile') });
  if (profile?.role === 'admin') items.push({ name: 'Admin', label: t('menu.admin') });

  return (
    <View style={[styles.root, rtl && styles.rootRtl]}>
      <Pressable style={styles.backdrop} onPress={close} />
      <Animated.View
        style={[
          styles.panel,
          { paddingTop: insets.top + spacing.lg, transform: [{ translateX: slide }] },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.appName, rtl && rtlTextStyle]}>{t('app.name')}</Text>
          <Text style={[styles.subtitle, rtl && rtlTextStyle]}>
            {session && profile
              ? t(`roleName.${profile.role}`, { ns: AUTH_NS })
              : t('app.tagline')}
          </Text>
        </View>

        <View style={styles.items}>
          {items.map((it) => (
            <Pressable key={it.name} style={styles.item} onPress={() => goSection(it.name)}>
              <Text style={[styles.itemText, rtl && rtlTextStyle]}>{it.label}</Text>
            </Pressable>
          ))}

          <View style={styles.separator} />

          <Pressable style={styles.item} onPress={contactSupport}>
            <Text style={[styles.itemText, rtl && rtlTextStyle]}>{t('menu.support')}</Text>
          </Pressable>
        </View>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appName: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  items: {
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  itemText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '500',
  },
});
