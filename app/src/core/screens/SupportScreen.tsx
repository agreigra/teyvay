import { useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { getSupportWhatsappNumber } from '../../modules/settings';
import { Screen } from '../components/Screen';
import { useIsRTL } from '../i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../theme';
import { openWhatsapp } from '../utils/whatsapp';

// Enable smooth accordion expand/collapse on Android.
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WARN = '#D97706';
const WARN_SOFT = '#FEF3C7';
const WARN_BORDER = '#FDE68A';

const FAQS = [1, 2, 3, 4];

export function SupportScreen() {
  const { t } = useTranslation();
  const rtl = useIsRTL();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (n: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((cur) => (cur === n ? null : n));
  };

  const sendWhatsapp = async (body: string) => {
    const number = await getSupportWhatsappNumber();
    if (!number) {
      Alert.alert(t('app.name'), t('menu.supportUnavailable'));
      return;
    }
    await openWhatsapp(number, body);
  };

  const onSend = () => {
    const subj = subject.trim();
    const msg = message.trim();
    const body = subj ? (msg ? `*${subj}*\n${msg}` : `*${subj}*`) : msg || t('menu.supportMessage');
    void sendWhatsapp(body);
  };

  const onReport = () => void sendWhatsapp(t('support.reportMessage'));

  const inputStyle = [styles.input, rtl && rtlTextStyle];

  return (
    <Screen scroll underHeader>
      {/* Hero */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={[styles.heroBadge, { alignSelf: rtl ? 'flex-end' : 'flex-start' }]}>
          <Feather name="message-circle" size={24} color={colors.surface} />
        </View>
        <Text style={[styles.heroTitle, rtl && rtlTextStyle]}>{t('support.heroTitle')}</Text>
        <Text style={[styles.heroSubtitle, rtl && rtlTextStyle]}>{t('support.heroSubtitle')}</Text>
      </LinearGradient>

      {/* Contact admin form */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, rtl && rtlTextStyle]}>{t('support.formTitle')}</Text>

        <Text style={[styles.label, rtl && rtlTextStyle]}>{t('support.subjectLabel')}</Text>
        <TextInput
          style={inputStyle}
          value={subject}
          onChangeText={setSubject}
          placeholder={t('support.subjectPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.label, rtl && rtlTextStyle]}>{t('support.messageLabel')}</Text>
        <TextInput
          style={[inputStyle, styles.textarea]}
          value={message}
          onChangeText={setMessage}
          placeholder={t('support.messagePlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        <Pressable style={[styles.sendBtn, rtl && styles.rowRev]} onPress={onSend}>
          <Feather name="send" size={18} color={colors.surface} />
          <Text style={styles.sendText}>{t('support.send')}</Text>
        </Pressable>
      </View>

      {/* Report a problem */}
      <View style={[styles.reportCard, rtl && styles.rowRev]}>
        <View style={[styles.reportHead, rtl && styles.rowRev]}>
          <Feather name="alert-triangle" size={18} color={WARN} />
          <Text style={[styles.reportTitle, rtl && rtlTextStyle]}>{t('support.reportTitle')}</Text>
        </View>
        <Pressable style={styles.reportBtn} onPress={onReport}>
          <Text style={styles.reportBtnText}>{t('support.reportButton')}</Text>
        </Pressable>
      </View>

      {/* FAQ */}
      <Text style={[styles.faqTitle, rtl && rtlTextStyle]}>{t('support.faqTitle')}</Text>
      {FAQS.map((n) => {
        const isOpen = open === n;
        return (
          <Pressable key={n} style={styles.faqCard} onPress={() => toggle(n)}>
            <View style={[styles.faqHead, rtl && styles.rowRev]}>
              <Text style={[styles.faqQ, rtl && rtlTextStyle]}>{t(`support.faq${n}Q`)}</Text>
              <Feather
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </View>
            {isOpen && (
              <Text style={[styles.faqA, rtl && rtlTextStyle]}>{t(`support.faq${n}A`)}</Text>
            )}
          </Pressable>
        );
      })}

      <Text style={styles.footer}>{t('support.footer')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowRev: { flexDirection: 'row-reverse' },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.body,
    lineHeight: 23,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 110,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  sendText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '700',
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: WARN_SOFT,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  reportHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  reportTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#92400E',
    flexShrink: 1,
  },
  reportBtn: {
    backgroundColor: WARN,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  reportBtnText: {
    color: colors.surface,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  faqTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  faqQ: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  faqA: {
    fontSize: typography.caption,
    color: colors.textMuted,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.lg,
  },
});
