import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme';
import { ShellScreen } from './ShellScreen';

// Root navigation shell. Feature modules will register their stacks here as
// they land (auth gate + role-based home in later steps).
export type RootStackParamList = {
  Shell: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.surface,
          headerShown: false,
        }}
      >
        <Stack.Screen name="Shell" component={ShellScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
