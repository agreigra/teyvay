import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppBar } from '../../../core/components/AppBar';
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

// Listings stack. Shares the AppBar header (List shows the hamburger; Detail /
// Create show a back arrow). List title is set dynamically by the screen.
export function AnnouncementsStack() {
  const { t } = useTranslation(ANNOUNCEMENTS_NS);
  return (
    <Stack.Navigator screenOptions={{ header: (props) => <AppBar {...props} /> }}>
      <Stack.Screen name="List" component={AnnouncementListScreen} />
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
