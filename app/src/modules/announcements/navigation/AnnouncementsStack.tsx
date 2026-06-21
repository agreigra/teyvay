import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../../core/theme';
import { ANNOUNCEMENTS_NS } from '../constants';
import { AnnouncementDetailScreen } from '../screens/AnnouncementDetailScreen';
import { AnnouncementListScreen } from '../screens/AnnouncementListScreen';
import { CreateAnnouncementScreen } from '../screens/CreateAnnouncementScreen';

export type AnnouncementsStackParamList = {
  List: undefined;
  Detail: { id: string };
  Create: undefined;
};

const Stack = createNativeStackNavigator<AnnouncementsStackParamList>();

// Main app stack (role-aware list -> detail -> create).
export function AnnouncementsStack() {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
      }}
    >
      <Stack.Screen
        name="List"
        component={AnnouncementListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={AnnouncementDetailScreen}
        options={{ title: t('detail.postedBy') }}
      />
      <Stack.Screen
        name="Create"
        component={CreateAnnouncementScreen}
        options={{ title: t('create.title') }}
      />
    </Stack.Navigator>
  );
}
