import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

type PaymentMethod = 'upi' | 'card' | 'netbanking';

type AddMoneyProps = {
  onClose?: () => void;
  onAddMoneyComplete?: (amount: number, method: PaymentMethod) => void;
};

export function AddMoney({ onClose, onAddMoneyComplete }: AddMoneyProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAddMoney = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (onAddMoneyComplete) {
      onAddMoneyComplete(numAmount, selectedMethod);
    }
    if (onClose) onClose();
  };

  const PaymentMethodButton = ({ method, title }: { method: PaymentMethod; title: string }) => (
    <TouchableOpacity
      style={[styles.methodButton, selectedMethod === method && styles.activeMethod]}
      onPress={() => setSelectedMethod(method)}
    >
      <ThemedText>{title}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Add Money</ThemedText>
        <TouchableOpacity onPress={onClose}>
          <ThemedText>✕</ThemedText>
        </TouchableOpacity>
      </View>

      {!showConfirmation ? (
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <ThemedText>Amount (₹)</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.methodsContainer}>
            <ThemedText type="subtitle">Payment Method</ThemedText>
            <View style={styles.methodsList}>
              <PaymentMethodButton method="upi" title="UPI" />
              <PaymentMethodButton method="card" title="Card" />
              <PaymentMethodButton method="netbanking" title="Net Banking" />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, !amount && styles.disabledButton]}
            onPress={handleAddMoney}
            disabled={!amount}
          >
            <ThemedText>Proceed to Add Money</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationDetails}>
            <ThemedText type="subtitle">Payment Details</ThemedText>
            <View style={styles.detailRow}>
              <ThemedText>Amount:</ThemedText>
              <ThemedText>₹{amount}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText>Payment Method:</ThemedText>
              <ThemedText>{selectedMethod.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText>Processing Fee:</ThemedText>
              <ThemedText>₹0</ThemedText>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <ThemedText>Confirm Payment</ThemedText>
          </TouchableOpacity>
        </View>
      )}
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
  content: {
    flex: 1,
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  methodsContainer: {
    gap: 16,
  },
  methodsList: {
    gap: 8,
  },
  methodButton: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  activeMethod: {
    backgroundColor: '#0a7ea4',
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  confirmationDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 8,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
});