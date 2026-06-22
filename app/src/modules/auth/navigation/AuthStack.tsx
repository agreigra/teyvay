import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppBar } from '../../../core/components/AppBar';
import { MenuScreen } from '../../../core/navigation/MenuScreen';
import { useAuth } from '../hooks/useAuth';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { OtpVerifyScreen } from '../screens/OtpVerifyScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SignInScreen } from '../screens/SignInScreen';

export type OtpMode = 'register' | 'reset';

export type AuthStackParamList = {
  SignIn: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerify: { phone: string; mode: OtpMode };
  Menu: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Unauthenticated flow: password sign-in by default; OTP is used only for
// first-time registration confirmation and password recovery. Shares the AppBar
// (hamburger menu + language switcher) so it's available on the auth screens.
export function AuthStack() {
  const { authInitialRoute } = useAuth();
  return (
    <Stack.Navigator
      initialRouteName={authInitialRoute}
      screenOptions={{ header: (props) => <AppBar {...props} /> }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
