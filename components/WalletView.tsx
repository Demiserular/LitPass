import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Modal } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ArrowUpRight, Wallet, Repeat, History, ArrowLeftRight } from 'lucide-react-native';
import { ConvertCoins } from './ConvertCoins';
import { useWallet } from '@/hooks/useWallet';

type WalletViewProps = {
  onAddMoney?: () => void;
  onConvertCoins?: () => void;
  onPayNow?: () => void;
  onViewHistory?: () => void;
};

export function WalletView({
  onAddMoney,
  onConvertCoins,
  onPayNow,
  onViewHistory,
}: WalletViewProps) {
  // In a real app, you would get the userId from your auth context
  const { wallet, loading, error } = useWallet('user-id-placeholder');
  const [showConvertCoins, setShowConvertCoins] = useState(false);
  
  const handleConversionComplete = (amount: number, toCoin: boolean) => {
    // This should be handled by a backend call
    setShowConvertCoins(false);
  };

  if (loading) {
    return <ThemedText>Loading wallet...</ThemedText>;
  }

  const safeBalance = wallet?.balance ?? 0;
  const safeCoins = wallet?.coins ?? 0;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Coin Wallet 💰</ThemedText>
      </View>
      
      <View style={styles.balanceContainer}>
        <ThemedText style={styles.balanceLabel}>Cash Balance</ThemedText>
        <ThemedText style={styles.balanceAmount}>₹{safeBalance.toFixed(2)}</ThemedText>
        <TouchableOpacity style={styles.accountButton} onPress={onViewHistory}>
          <ThemedText style={styles.accountText}>Account & Routing</ThemedText>
          <ArrowUpRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onAddMoney}>
          <View style={styles.actionButtonContent}>
            <ThemedText style={styles.actionText}>Add Cash</ThemedText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onPayNow}>
          <View style={styles.actionButtonContent}>
            <ThemedText style={styles.actionText}>Cash Out</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.exchangeContainer}>
        <TouchableOpacity 
          style={styles.exchangeButton} 
          onPress={() => setShowConvertCoins(true)}
        >
          <ArrowLeftRight size={20} color="#fff" />
          <ThemedText style={styles.exchangeText}>Exchange Money & Coins</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => setShowConvertCoins(true)}
        >
          <View style={styles.cardIcon}>
            <Wallet size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardTitle}>Savings</ThemedText>
            <ThemedText style={styles.cardAmount}>₹{safeCoins.toFixed(2)}</ThemedText>
            <ThemedText style={styles.cardSubtext}>Save for a goal</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onViewHistory}>
          <View style={styles.cardIcon}>
            <History size={24} color="#2196F3" />
          </View>
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardTitle}>Free tax filing</ThemedText>
            <ThemedText style={styles.cardSubtext}>File your taxes for free</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showConvertCoins}
        animationType="slide"
        transparent={true}
      >
        <ConvertCoins 
          onClose={() => setShowConvertCoins(false)}
          onConversionComplete={handleConversionComplete}
        />
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  balanceContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    borderRadius: 12,
    width: '100%',
  },
  accountText: {
    flex: 1,
    color: '#fff',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    height: 60,
  },
  actionButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exchangeContainer: {
    marginBottom: 20,
  },
  exchangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  exchangeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#999',
  }
});