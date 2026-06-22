import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AnnouncementsStack } from '../../modules/announcements';
import { AdminHomeScreen } from '../../modules/admin';
import { ProfileScreen } from '../../modules/profile';
import { AppBar } from '../components/AppBar';
import { AboutScreen } from '../screens/AboutScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { MenuScreen } from './MenuScreen';

export type AppMenuParamList = {
  Announcements: undefined;
  Profile: undefined;
  Admin: undefined;
  About: undefined;
  Support: undefined;
  Menu: undefined;
};

const Stack = createNativeStackNavigator<AppMenuParamList>();

// Main app shell. Sections (Announcements / Profile / Admin) share the AppBar
// header; the hamburger opens a transparent-modal slide-in Menu.
export function AppMenuStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ header: (props) => <AppBar {...props} /> }}>
      <Stack.Screen
        name="Announcements"
        component={AnnouncementsStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('menu.profile') }}
      />
      <Stack.Screen
        name="Admin"
        component={AdminHomeScreen}
        options={{ title: t('menu.admin') }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: t('menu.about') }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: t('menu.support') }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}
