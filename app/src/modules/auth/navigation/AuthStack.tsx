import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../../core/theme';
import { OtpVerifyScreen } from '../screens/OtpVerifyScreen';
import { PhoneLoginScreen } from '../screens/PhoneLoginScreen';

export type AuthStackParamList = {
  PhoneLogin: undefined;
  OtpVerify: { phone: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Unauthenticated flow: phone entry -> OTP verification.
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
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </Stack.Navigator>
  );
}
