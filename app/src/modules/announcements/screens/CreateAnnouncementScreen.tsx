import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../../core/components/Screen';
import type { NewAnnouncement } from '../../../core/types/database';
import { useAuth } from '../../auth';
import { AnnouncementForm } from '../components/AnnouncementForm';
import { ANNOUNCEMENTS_NS } from '../constants';
import type { AnnouncementsStackParamList } from '../navigation/AnnouncementsStack';
import { create } from '../services/announcements.service';

type Props = NativeStackScreenProps<AnnouncementsStackParamList, 'Create'>;

export function CreateAnnouncementScreen({ navigation }: Props) {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  const { profile } = useAuth();

  const onSubmit = async (input: NewAnnouncement) => {
    if (!profile) return;
    await create(profile.id, input);
    navigation.goBack();
    // New listings start pending until an admin approves them.
    Alert.alert(t('create.submittedTitle'), t('create.submittedBody'));
  };

  return (
    <Screen scroll>
      <AnnouncementForm
        heading={t('create.title')}
        icon="plus-square"
        subtitle={t('create.reviewNote')}
        submitLabel={t('create.submit')}
        submittingLabel={t('create.submitting')}
        onSubmit={onSubmit}
      />
    </Screen>
  );
}
