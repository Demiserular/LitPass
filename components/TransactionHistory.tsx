import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { SkeletonTransactionHistory } from './SkeletonComponents';
import { useTransactions } from '@/hooks/useTransactions';

type Transaction = {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  date: string;
  description: string;
  isCoin?: boolean;
};

type TransactionHistoryProps = {
  onClose?: () => void;
};

export function TransactionHistory({ onClose }: TransactionHistoryProps) {
  // In a real app, you would get the userId from your auth context
  const { transactions, loading, error } = useTransactions('user-id-placeholder');
  
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const filteredTransactions = transactions.filter(
    (tx) => filter === 'all' || tx.type === filter
  );

  if (loading) {
    return <SkeletonTransactionHistory />;
  }

  if (error) {
    return <ThemedText>Error loading transactions.</ThemedText>;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Transaction History</ThemedText>
        <TouchableOpacity onPress={onClose}>
          <ThemedText>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <ThemedText>All</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'received' && styles.activeFilter]}
          onPress={() => setFilter('received')}
        >
          <ThemedText>Received</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'sent' && styles.activeFilter]}
          onPress={() => setFilter('sent')}
        >
          <ThemedText>Sent</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.transactionList}>
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transaction}>
            <View style={styles.transactionIcon}>
              <ThemedText style={styles.icon}>
                {transaction.type === 'received' ? '🟢' : '🔴'}
              </ThemedText>
            </View>
            <View style={styles.transactionDetails}>
              <ThemedText type="defaultSemiBold">{transaction.description}</ThemedText>
              <ThemedText>{transaction.date}</ThemedText>
            </View>
            <View style={styles.transactionAmount}>
              <ThemedText type="defaultSemiBold">
                {transaction.type === 'received' ? '+' : '-'}
                {transaction.isCoin ? '' : '₹'}
                {transaction.amount}
                {transaction.isCoin ? ' Coins' : ''}
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeFilter: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionList: {
    flex: 1,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionIcon: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
});