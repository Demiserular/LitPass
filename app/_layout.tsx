import 'react-native-url-polyfill/auto';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { ThemeProvider, useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/Toast';
import { ScreenErrorBoundary } from '@/components/ErrorBoundaries';
import { Provider } from 'react-redux';
import { store } from '../store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { theme, isLoading } = useTheme();
  const colors = useThemeColors();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded || isLoading) {
    return null;
  }

  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...((theme === 'dark' ? DarkTheme : DefaultTheme).colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.secondaryBackground,
      text: colors.text,
      border: colors.separator,
      notification: colors.accent,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <ToastProvider>
        <ScreenWrapper>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: Platform.select({
                ios: 'simple_push',
                android: 'slide_from_right',
                web: 'fade',
                default: 'slide_from_right',
              }),
              animationDuration: 320,
              presentation: 'card',
              fullScreenSwipeEnabled: Platform.OS === 'ios',
              contentStyle: {
                backgroundColor: colors.background
              },
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}>
            <Stack.Screen 
              name="(tabs)" 
              options={{
                animation: Platform.select({
                  ios: 'fade',
                  android:'none',
                  default: 'none'
                })
              }}
            />
            <Stack.Screen 
              name="+not-found" 
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="event-details"
              options={{
                animation: Platform.select({
                  ios: 'fade_from_bottom',
                  android: 'slide_from_right',
                  default: 'fade',
                }),
                presentation: Platform.select({
                  ios: 'modal',
                  android: 'card',
                  default: 'modal',
                }),
                animationDuration: 360,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="test-components" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom',
                animationDuration: 400
              }} 
            />
            <Stack.Screen 
              name="settings" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom',
                animationDuration: 400
              }} 
            />
            <Stack.Screen 
              name="test-errors" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom',
                animationDuration: 400
              }} 
            />
          </Stack>
        </ScreenWrapper>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </ToastProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ScreenErrorBoundary screenName="App Root">
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </ScreenErrorBoundary>
    </Provider>
  );
}
