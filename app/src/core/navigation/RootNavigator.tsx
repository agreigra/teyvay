import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStack, RoleSelectScreen, useAuth } from '../../modules/auth';
import { colors } from '../theme';
import { ShellScreen } from './ShellScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.surface,
  headerShown: false,
} as const;

// Authenticated, onboarded home. Role-based screens land here in later steps.
function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Shell" component={ShellScreen} />
    </Stack.Navigator>
  );
}

// Post-login onboarding (role selection).
function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
    </Stack.Navigator>
  );
}

function Splash() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

// Top-level gate: auth flow -> onboarding -> main app.
export function RootNavigator() {
  const { initializing, session, needsOnboarding } = useAuth();

  if (initializing) return <Splash />;

  return (
    <NavigationContainer>
      {!session ? (
        <AuthStack />
      ) : needsOnboarding ? (
        <OnboardingNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
