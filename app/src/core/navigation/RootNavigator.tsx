import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AnnouncementsStack } from '../../modules/announcements';
import {
  AuthStack,
  RoleSelectScreen,
  SetNewPasswordScreen,
  useAuth,
} from '../../modules/auth';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.surface,
  headerShown: false,
} as const;

// Authenticated, onboarded home: the role-aware announcements stack.
function MainNavigator() {
  return <AnnouncementsStack />;
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
  } else if (needsOnboarding) {
    content = <OnboardingNavigator />;
  } else {
    content = <MainNavigator />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}
