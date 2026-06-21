import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../core/components/Button';
import { Field } from '../../../core/components/Field';
import { Screen } from '../../../core/components/Screen';
import { useIsRTL } from '../../../core/i18n';
import { colors, rtlTextStyle, spacing, typography } from '../../../core/theme';
import { useAuth } from '../../auth';
import { ANNOUNCEMENTS_NS } from '../constants';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';
import { create } from '../services/announcements.service';

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'Create'>;

export function CreateAnnouncementScreen({ navigation }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const { profile } = useAuth();
  const rtl = useIsRTL();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!title.trim()) {
      setError(t('errors.titleRequired'));
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError(t('errors.invalidPrice'));
      return;
    }
    if (!profile) return;
    setError(null);
    setLoading(true);
    try {
      await create(profile.id, {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
      });
      navigation.goBack();
    } catch {
      Alert.alert(t('errors.saveFailed'));
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={[styles.title, rtl && rtlTextStyle]}>{t('create.title')}</Text>

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
        label={loading ? t('create.submitting') : t('create.submit')}
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
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
