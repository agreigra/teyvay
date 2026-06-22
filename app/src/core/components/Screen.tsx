import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

type Props = {
  children: ReactNode;
  // Set on form screens so content scrolls and stays clear of the keyboard.
  scroll?: boolean;
  // Set when the screen is shown under the AppBar header (which already covers
  // the top inset) so we don't pad the top a second time.
  underHeader?: boolean;
};

const WITH_TOP: Edge[] = ['top', 'left', 'right', 'bottom'];
const NO_TOP: Edge[] = ['left', 'right', 'bottom'];

// Standard screen wrapper: safe-area aware + themed background + padding.
// Wraps content in a KeyboardAvoidingView so focused inputs aren't hidden
// behind the keyboard; pass `scroll` on forms to make the content scrollable.
export function Screen({ children, scroll = false, underHeader = false }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={underHeader ? NO_TOP : WITH_TOP}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
});
