import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import i18n, { hasSelectedLanguage, initI18n } from './src/core/i18n';
import { RootNavigator } from './src/core/navigation/RootNavigator';
import { colors } from './src/core/theme';
import { registerSettingsLocales } from './src/modules/settings';

export default function App() {
  const [ready, setReady] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);

  useEffect(() => {
    (async () => {
      await initI18n();
      registerSettingsLocales();
      setLanguageSelected(await hasSelectedLanguage());
    })().finally(() => setReady(true));
  }, []);

  if (!ready) {
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

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <RootNavigator languageSelected={languageSelected} />
        <StatusBar style="auto" />
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
