import { Tabs } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppStore } from '../../src/store/appStore';
import { FileUploadScreen } from '../../src/components/upload/FileUploadScreen';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function TabsLayout() {
  const clearData = useAppStore((s) => s.clearData);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1f2937',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: '#111827' },
        headerTitleStyle: { fontWeight: '700', color: '#f9fafb' },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity onPress={clearData} style={{ marginRight: 16, padding: 4 }}>
            <Text style={{ fontSize: 20, color: '#6b7280' }}>↺</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="biometrics"
        options={{
          title: 'Biometrics',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚖️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="strength"
        options={{
          title: 'Strength',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💪" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

export default function Layout() {
  const { status, initFromStorage } = useAppStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initFromStorage().finally(() => setInitializing(false));
  }, []);

  if (initializing) {
    return <View style={{ flex: 1, backgroundColor: '#111827' }} />;
  }
  if (status !== 'ready') {
    return <FileUploadScreen />;
  }
  return <TabsLayout />;
}
