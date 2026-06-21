import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../../core/components/Screen';
import { colors } from '../../../core/theme';
import type { Announcement, NewAnnouncement } from '../../../core/types/database';
import { AnnouncementForm } from '../components/AnnouncementForm';
import { ANNOUNCEMENTS_NS } from '../constants';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';
import { getById, update } from '../services/announcements.service';

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
    navigation.goBack();
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>{t('errors.loadFailed')}</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AnnouncementForm
        heading={t('edit.title')}
        icon="edit-2"
        submitLabel={t('edit.submit')}
        submittingLabel={t('edit.submitting')}
        initial={{ title: item.title, description: item.description ?? '', price: item.price }}
        onSubmit={onSubmit}
      />
    </Screen>
  );
}
