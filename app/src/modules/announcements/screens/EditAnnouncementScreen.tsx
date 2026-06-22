import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../../core/components/Screen';
import { colors } from '../../../core/theme';
import type { Announcement, NewAnnouncement } from '../../../core/types/database';
import { AnnouncementForm } from '../components/AnnouncementForm';
import { ANNOUNCEMENTS_NS } from '../constants';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';
import { getById, setStatus, update } from '../services/announcements.service';

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'Edit'>;

export function EditAnnouncementScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getById(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (input: NewAnnouncement) => {
    await update(id, input);
    // Editing an approved listing sends it back to the review queue.
    const requeued = item?.status === 'active';
    if (requeued) await setStatus(id, 'pending');
    navigation.goBack();
    if (requeued) Alert.alert(t('edit.requeuedTitle'), t('edit.requeuedBody'));
  };

  if (loading) {
    return (
      <Screen underHeader>
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen underHeader>
        <Text style={{ color: colors.textMuted }}>{t('errors.loadFailed')}</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll underHeader>
      <AnnouncementForm
        heading={t('edit.title')}
        icon="edit-2"
        submitLabel={t('edit.submit')}
        submittingLabel={t('edit.submitting')}
        initial={{
          title: item.title,
          description: item.description ?? '',
          title_fr: item.title_fr,
          description_fr: item.description_fr,
          title_en: item.title_en,
          description_en: item.description_en,
          price: item.price,
          quantity: item.quantity,
        }}
        onSubmit={onSubmit}
      />
    </Screen>
  );
}
