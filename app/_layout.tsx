import { Stack } from 'expo-router';
import { useEffect, Component, type ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, ScrollView } from 'react-native';
import '../global.css';

SplashScreen.preventAutoHideAsync();

interface ErrorBoundaryState { error: Error | null }

class RootErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', padding: 24, paddingTop: 60 }}>
        <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          Something went wrong
        </Text>
        <ScrollView>
          <Text style={{ color: '#f87171', fontSize: 12, fontFamily: 'monospace' }}>
            {error.message}{'\n\n'}{error.stack}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <RootErrorBoundary>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </RootErrorBoundary>
  );
}
