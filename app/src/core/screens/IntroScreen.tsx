import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../modules/auth';
import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';

type FeatherName = keyof typeof Feather.glyphMap;

const { width } = Dimensions.get('window');

const SLIDES: { key: string; icon: FeatherName }[] = [
  { key: '1', icon: 'shield' },
  { key: '2', icon: 'search' },
  { key: '3', icon: 'plus-square' },
  { key: '4', icon: 'message-circle' },
];

// First-launch walkthrough: a swipeable carousel explaining the app, ending
// with a "create account" call to action. Shown once (flag in AsyncStorage).
export function IntroScreen() {
  const { t } = useTranslation();
  const rtl = useIsRTL();
  const { completeIntro, openAuth } = useAuth();

  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const onViewableItemsChanged = useRef((info: { viewableItems: ViewToken[] }) => {
    const first = info.viewableItems[0];
    if (first?.index != null) setIndex(first.index);
  }).current;

  const next = () => {
    if (isLast) return;
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const finish = async (then?: () => void) => {
    await completeIntro();
    then?.();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {/* Skip */}
      <View style={[styles.topBar, rtl && styles.rowRev]}>
        <Pressable hitSlop={8} onPress={() => finish()}>
          <Text style={styles.skip}>{t('intro.skip')}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Feather name={item.icon} size={56} color={colors.surface} />
            </LinearGradient>
            <Text style={[styles.title, rtl && rtlTextStyle]}>
              {t(`intro.slide${item.key}Title`)}
            </Text>
            <Text style={[styles.body, rtl && rtlTextStyle]}>
              {t(`intro.slide${item.key}Body`)}
            </Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isLast ? (
          <>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => finish(() => openAuth('Register'))}
            >
              <Text style={styles.primaryText}>{t('intro.createAccount')}</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => finish()}>
              <Text style={styles.secondaryText}>{t('intro.browse')}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={[styles.primaryBtn, rtl && styles.rowRev]} onPress={next}>
            <Text style={styles.primaryText}>{t('intro.next')}</Text>
            <Feather
              name={rtl ? 'arrow-left' : 'arrow-right'}
              size={18}
              color={colors.surface}
            />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rowRev: { flexDirection: 'row-reverse' },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skip: {
    fontSize: typography.body,
    color: colors.textMuted,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  badge: {
    width: 132,
    height: 132,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  primaryText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  secondaryText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
