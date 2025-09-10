import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Animated, Platform } from 'react-native'; // Added Platform
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ArrowLeftRight, ArrowRight, Coins, DollarSign } from 'lucide-react-native';

// Conditionally import LinearGradient
let LinearGradient: any;
try {
  if (Platform.OS !== 'web') {
    LinearGradient = require('react-native-linear-gradient').default;
  }
} catch (error) {
  console.warn('Failed to load react-native-linear-gradient:', error);
  LinearGradient = View; // Fallback to View if import fails
}

type ConvertCoinsProps = {
  onClose?: () => void;
  onConversionComplete?: (amount: number, toCoin: boolean) => void;
};

export function ConvertCoins({ onClose, onConversionComplete }: ConvertCoinsProps) {
  const [amount, setAmount] = useState('');
  const [toCoin, setToCoin] = useState(true); // true = money to coins, false = coins to money
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConvert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (onConversionComplete) {
      onConversionComplete(numAmount, toCoin);
    }
    if (onClose) onClose();
  };

  return (
    <ThemedView style={styles.container}>
      {Platform.OS !== 'web' && LinearGradient ? (
        <LinearGradient
          colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <ArrowLeftRight size={24} color="#fff" style={styles.headerIcon} />
              <ThemedText type="title">Convert {toCoin ? 'Money to Coins' : 'Coins to Money'}</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeIcon}>✕</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      ) : (
        // Web fallback for header
        <View style={[styles.headerGradient, styles.headerWebFallback]}>
           <View style={styles.header}>
            <View style={styles.titleContainer}>
              <ArrowLeftRight size={24} color="#fff" style={styles.headerIcon} />
              <ThemedText type="title">Convert {toCoin ? 'Money to Coins' : 'Coins to Money'}</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeIcon}>✕</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showConfirmation ? (
        <View style={styles.content}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, toCoin && styles.activeToggle]}
              onPress={() => setToCoin(true)}
            >
              <DollarSign size={20} color={toCoin ? '#fff' : '#aaa'} style={styles.buttonIcon} />
              <ThemedText style={[styles.buttonText, toCoin && styles.activeText]}>Money to Coins</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !toCoin && styles.activeToggle]}
              onPress={() => setToCoin(false)}
            >
              <Coins size={20} color={!toCoin ? '#fff' : '#aaa'} style={styles.buttonIcon} />
              <ThemedText style={[styles.buttonText, !toCoin && styles.activeText]}>Coins to Money</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText>Amount</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder={`Enter ${toCoin ? 'money' : 'coins'} amount`}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          {Platform.OS !== 'web' && LinearGradient ? (
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.conversionRate}
            >
              <DollarSign size={20} color="#fdbb2d" />
              <ThemedText style={styles.rateText}>Conversion Rate: ₹1 = 1 Coin</ThemedText>
              <ArrowRight size={20} color="#fdbb2d" />
              <Coins size={20} color="#fdbb2d" />
            </LinearGradient>
          ) : (
            // Web fallback for conversion rate
            <View style={[styles.conversionRate, styles.conversionRateWebFallback]}>
              <DollarSign size={20} color="#fdbb2d" />
              <ThemedText style={styles.rateText}>Conversion Rate: ₹1 = 1 Coin</ThemedText>
              <ArrowRight size={20} color="#fdbb2d" />
              <Coins size={20} color="#fdbb2d" />
            </View>
          )}

          <TouchableOpacity
            style={[styles.convertButton, !amount && styles.disabledButton]}
            onPress={handleConvert}
            disabled={!amount}
          >
            <ThemedText>Preview Conversion</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.confirmationContainer}>
          <View style={styles.conversionDetails}>
            <ThemedText type="subtitle">Conversion Details</ThemedText>
            <View style={styles.detailRow}>
              <ThemedText>You'll {toCoin ? 'spend' : 'convert'}:</ThemedText>
              <ThemedText>{toCoin ? '₹' : ''}{amount}{!toCoin ? ' Coins' : ''}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText>You'll {toCoin ? 'receive' : 'receive'}:</ThemedText>
              <ThemedText>{!toCoin ? '₹' : ''}{amount}{toCoin ? ' Coins' : ''}</ThemedText>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <ThemedText>Confirm Conversion</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    borderRadius: 16,
    marginBottom: 24,
  },
  // Added web fallback style
  headerWebFallback: {
    backgroundColor: '#1a2a6c', // Simple background color for web
    padding: 16, // Ensure padding is applied if not inherent
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    marginRight: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#aaa',
  },
  activeText: {
    color: '#fff',
  },
  rateText: {
    marginHorizontal: 8,
    color: '#fdbb2d',
  },
  // Added web fallback style
  conversionRateWebFallback: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Simple background for web
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
    gap: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#2d3436',
    borderWidth: 1,
    borderColor: '#fdbb2d',
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
  conversionRate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  convertButton: {
    backgroundColor: '#fdbb2d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#fdbb2d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  conversionDetails: {
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