import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import type { NewAnnouncement } from '../../../core/types/database';
import { ANNOUNCEMENTS_NS } from '../constants';

type Props = {
  heading: string;
  submitLabel: string;
  submittingLabel: string;
  initial?: Partial<NewAnnouncement>;
  onSubmit: (input: NewAnnouncement) => Promise<void>;
};

// Shared create/edit form for a listing's content (title/description/price).
export function AnnouncementForm({
  heading,
  submitLabel,
  submittingLabel,
  initial,
  onSubmit,
}: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const rtl = useIsRTL();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(
    initial?.price != null ? String(initial.price) : '',
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
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
      });
    } catch {
      Alert.alert(t('errors.saveFailed'));
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, rtl && rtlTextStyle]}>{heading}</Text>

      <Field
        label={t('create.titleLabel')}
        placeholder={t('create.titlePlaceholder')}
        value={title}
        onChangeText={setTitle}
      />
      <Field
        label={t('create.descriptionLabel')}
        placeholder={t('create.descriptionPlaceholder')}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.multiline}
      />
      <Field
        label={t('create.priceLabel')}
        placeholder={t('create.pricePlaceholder')}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        error={error}
      />

      <Button
        label={loading ? submittingLabel : submitLabel}
        onPress={submit}
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
