import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WalletView } from '@/components/WalletView';
import { SkeletonWallet } from '@/components/SkeletonComponents';
import { useSimulatedLoading } from '@/hooks/useSkeletonLoader';
import { ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { ScreenTransition } from '@/components/PageTransition';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTickets } from '@/store/slices/ticketsSlice';
import { useEffect } from 'react';

export default function WalletScreen() {
  const dispatch = useAppDispatch();
  const { tickets, loading: ticketsLoading, error: ticketsError } = useAppSelector((state) => state.tickets);
  const { theme } = useTheme();
  const colors = useThemeColors();

  useEffect(() => {
    // In a real app, you would get the userId from your auth context
    dispatch(fetchTickets('user-id-placeholder'));
  }, [dispatch]);

  if (ticketsLoading) {
    return (
      <ComponentErrorBoundary componentName="WalletPage">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <SkeletonWallet />
        </SafeAreaView>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ScreenTransition transitionType="slide" duration={280}>
      <ComponentErrorBoundary componentName="WalletScreen">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <WalletView />
        </SafeAreaView>
      </ComponentErrorBoundary>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});