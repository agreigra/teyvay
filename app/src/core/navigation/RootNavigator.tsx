import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  AuthStack,
  RoleSelectScreen,
  SetNewPasswordScreen,
  useAuth,
} from '../../modules/auth';
import { ReactivateAccountScreen } from '../../modules/profile';
import { colors } from '../theme';
import { AppMenuStack } from './AppMenuStack';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.surface,
  headerShown: false,
} as const;

// Main app shell (guests + authed): sections + modal menu around the stacks.
function MainNavigator() {
  return <AppMenuStack />;
}

// Post-login onboarding (role selection).
function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
    </Stack.Navigator>
  );
}

// Recovery: set a new password after a successful reset OTP.
function ResetPasswordNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
    </Stack.Navigator>
  );
}

// Soft-deleted account: reactivate or sign out before using the app.
function ReactivateNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Reactivate" component={ReactivateAccountScreen} />
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
  const {
    initializing,
    session,
    needsOnboarding,
    accountDeleted,
    passwordResetPending,
    authPrompt,
  } = useAuth();

  if (initializing) return <Splash />;

  // Logged out: browse publicly by default; show the auth flow only when the
  // guest asks to sign in.
  let content;
  if (!session) {
    content = authPrompt ? <AuthStack /> : <MainNavigator />;
  } else if (passwordResetPending) {
    content = <ResetPasswordNavigator />;
  } else if (accountDeleted) {
    content = <ReactivateNavigator />;
  } else if (needsOnboarding) {
    content = <OnboardingNavigator />;
  } else {
    content = <MainNavigator />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}
