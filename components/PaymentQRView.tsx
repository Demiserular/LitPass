import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Vibration } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

type PaymentQRViewProps = {
  onClose?: () => void;
  onPaymentComplete?: (amount: number) => void;
};

export function PaymentQRView({ onClose, onPaymentComplete }: PaymentQRViewProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'scanning' | 'processing' | 'complete' | 'error'>('scanning');

  // Mock payment processing
  const handlePaymentProcess = () => {
    setPaymentStatus('processing');
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('complete');
      Vibration.vibrate(200); // Provide haptic feedback
      if (onPaymentComplete) {
        onPaymentComplete(100); // Mock payment amount
      }
    }, 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Scan to Pay</ThemedText>
        <TouchableOpacity onPress={onClose}>
          <ThemedText>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        {paymentStatus === 'scanning' && (
          <>
            <View style={styles.qrFrame}>
              <View style={styles.scanLine} />
            </View>
            <ThemedText style={styles.scanText}>Scanning for QR Code...</ThemedText>
            {/* Mock QR detection */}
            <TouchableOpacity 
              style={styles.mockButton} 
              onPress={handlePaymentProcess}
            >
              <ThemedText>Mock: Detect QR Code</ThemedText>
            </TouchableOpacity>
          </>
        )}

        {paymentStatus === 'processing' && (
          <View style={styles.statusContainer}>
            <ThemedText type="title">Processing Payment</ThemedText>
            <ThemedText>Please wait...</ThemedText>
          </View>
        )}

        {paymentStatus === 'complete' && (
          <View style={styles.statusContainer}>
            <ThemedText type="title" style={styles.successText}>✓</ThemedText>
            <ThemedText type="subtitle">Payment Complete!</ThemedText>
            <ThemedText>₹100 paid successfully</ThemedText>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={onClose}
            >
              <ThemedText>Done</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#0a7ea4',
    position: 'absolute',
  },
  scanText: {
    marginTop: 24,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 16,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 48,
  },
  mockButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  doneButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
});