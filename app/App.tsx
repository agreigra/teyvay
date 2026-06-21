import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import i18n, { hasSelectedLanguage, initI18n } from './src/core/i18n';
import { RootNavigator } from './src/core/navigation/RootNavigator';
import { colors } from './src/core/theme';
import { registerAnnouncementsLocales } from './src/modules/announcements';
import { AuthProvider, registerAuthLocales } from './src/modules/auth';
import { LanguageSelectScreen, registerSettingsLocales } from './src/modules/settings';

export default function App() {
  const [ready, setReady] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);

  useEffect(() => {
    (async () => {
      await initI18n();
      registerSettingsLocales();
      registerAuthLocales();
      registerAnnouncementsLocales();
      setLanguageSelected(await hasSelectedLanguage());
    })().finally(() => setReady(true));
  }, []);

  let content;
  if (!ready) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  } else if (!languageSelected) {
    // First launch: choose a language before anything else.
    content = <LanguageSelectScreen onDone={() => setLanguageSelected(true)} />;
  } else {
    content = (
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        {content}
        <StatusBar style="auto" />
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

const styles = {
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.background,
  },
};
