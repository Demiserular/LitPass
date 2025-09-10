import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Home, Search, MessageCircle, User, Wallet } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { SafeTabBar } from '@/components/SafeTabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');

  return (
    <Tabs
      tabBar={(props) => <SafeTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: iconColor,
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#666' : '#999',
        tabBarShowLabel: true,
        tabBarStyle: { position: 'absolute' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} style={{ opacity: 0.9 }} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search size={24} color={color} style={{ opacity: 0.9, marginTop: 5 }} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <Wallet size={24} color={color} style={{ opacity: 0.9, marginTop: 5 }} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} style={{ opacity: 0.9 }} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} style={{ opacity: 0.9 }} />,
        }}
      />
    </Tabs>
  );
}