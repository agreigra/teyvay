import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { LanguageSelectScreen } from '../../modules/settings';
import { colors } from '../theme';
import { ShellScreen } from './ShellScreen';

// Root navigation shell. Feature modules register their stacks here as they
// land (auth gate + role-based home in later steps).
export type RootStackParamList = {
  LanguageSelect: undefined;
  Shell: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Bridges the settings module's onDone callback to navigation.
function LanguageSelectRoute() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return <LanguageSelectScreen onDone={() => navigation.replace('Shell')} />;
}

export function RootNavigator({
  languageSelected,
}: {
  languageSelected: boolean;
}) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={languageSelected ? 'Shell' : 'LanguageSelect'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.surface,
          headerShown: false,
        }}
      >
        <Stack.Screen name="LanguageSelect" component={LanguageSelectRoute} />
        <Stack.Screen name="Shell" component={ShellScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
