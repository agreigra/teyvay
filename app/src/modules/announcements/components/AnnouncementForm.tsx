import { ReactNode, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { useIsRTL } from '../../../core/i18n';
import { colors, radius, rtlTextStyle, spacing, typography } from '../../../core/theme';
import type { NewAnnouncement } from '../../../core/types/database';
import { ANNOUNCEMENTS_NS } from '../constants';
import { GradientHeader } from './GradientHeader';

type FeatherName = keyof typeof Feather.glyphMap;

type Props = {
  heading: string;
  icon: FeatherName;
  subtitle?: string;
  submitLabel: string;
  submittingLabel: string;
  initial?: Partial<NewAnnouncement>;
  onSubmit: (input: NewAnnouncement) => Promise<void>;
};

function Section({
  icon,
  title,
  children,
}: {
  icon: FeatherName;
  title: string;
  children: ReactNode;
}) {
  const rtl = useIsRTL();
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, rtl && styles.rowRev]}>
        <Feather name={icon} size={16} color={colors.primary} />
        <Text style={[styles.sectionTitle, rtl && rtlTextStyle]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// Shared create/edit form: primary (Arabic) content, optional French
// translation, and price/quantity — grouped into labelled sections.
export function AnnouncementForm({
  heading,
  icon,
  subtitle,
  submitLabel,
  submittingLabel,
  initial,
  onSubmit,
}: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const rtl = useIsRTL();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [titleFr, setTitleFr] = useState(initial?.title_fr ?? '');
  const [descriptionFr, setDescriptionFr] = useState(initial?.description_fr ?? '');
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initial?.description_en ?? '');
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '');
  const [quantity, setQuantity] = useState(
    initial?.quantity != null ? String(initial.quantity) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      setError(t('errors.titleRequired'));
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError(t('errors.invalidPrice'));
      return;
    }
    let quantityNum: number | null = null;
    if (quantity.trim()) {
      quantityNum = Number(quantity);
      if (!Number.isInteger(quantityNum) || quantityNum < 0) {
        setError(t('errors.invalidQuantity'));
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        title_fr: titleFr.trim() || null,
        description_fr: descriptionFr.trim() || null,
        title_en: titleEn.trim() || null,
        description_en: descriptionEn.trim() || null,
        price: priceNum,
        quantity: quantityNum,
      });
    } catch {
      Alert.alert(t('errors.saveFailed'));
      setLoading(false);
    }
  };

  return (
    <>
      <GradientHeader icon={icon} title={heading} subtitle={subtitle} />

      <Section icon="file-text" title={t('form.sectionMain')}>
        <Field
          label={t('form.nameLabel')}
          placeholder={t('form.namePlaceholder')}
          value={title}
          onChangeText={setTitle}
        />
        <Field
          label={t('form.descLabel')}
          placeholder={t('form.descPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />
      </Section>

      <Section icon="globe" title={t('form.sectionFr')}>
        <Field
          label={t('form.titleFrLabel')}
          placeholder="Titre du produit"
          value={titleFr}
          onChangeText={setTitleFr}
        />
        <Field
          label={t('form.descFrLabel')}
          placeholder="Description du produit"
          value={descriptionFr}
          onChangeText={setDescriptionFr}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />
      </Section>

      <Section icon="globe" title={t('form.sectionEn')}>
        <Field
          label={t('form.titleEnLabel')}
          placeholder="Product title"
          value={titleEn}
          onChangeText={setTitleEn}
        />
        <Field
          label={t('form.descEnLabel')}
          placeholder="Product description"
          value={descriptionEn}
          onChangeText={setDescriptionEn}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />
      </Section>

      <Section icon="tag" title={t('form.sectionPricing')}>
        <Field
          label={t('form.priceLabel')}
          placeholder="0"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Field
          label={t('form.quantityLabel')}
          placeholder={t('form.quantityPlaceholder')}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
        />
      </Section>

      {!!error && <Text style={[styles.error, rtl && rtlTextStyle]}>{error}</Text>}

      <Button
        label={loading ? submittingLabel : submitLabel}
        onPress={submit}
        loading={loading}
        icon="send"
      />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rowRev: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
});
