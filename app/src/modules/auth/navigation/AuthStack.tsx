import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../../core/theme';
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
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Unauthenticated flow: password sign-in by default; OTP is used only for
// first-time registration confirmation and password recovery.
export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitle: '',
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </Stack.Navigator>
  );
}
