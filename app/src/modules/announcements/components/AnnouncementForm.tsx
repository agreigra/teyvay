import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { colors, radius, spacing } from '../../../core/theme';
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

// Shared create/edit form for a listing's content (title/description/price).
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
    <>
      <GradientHeader icon={icon} title={heading} subtitle={subtitle} />

      <View style={styles.card}>
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
      </View>

      <Button
        label={loading ? submittingLabel : submitLabel}
        onPress={submit}
        loading={loading}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
