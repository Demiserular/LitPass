import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { X } from 'lucide-react-native';

interface PaymentViewProps {
  isVisible: boolean;
  onClose: () => void;
  eventId: string;
  amount: number;
}

type PaymentStatus = 'pending' | 'authorized' | 'expired' | 'invalid' | null;

export function PaymentView({ isVisible, onClose, eventId, amount }: PaymentViewProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (isVisible) {
      const mockPaymentToken = `PAY-${eventId}-${Date.now()}`;
      setQrValue(mockPaymentToken);
      setPaymentStatus('pending');
      
      // Auto complete payment after 10 seconds
      const paymentTimer = setTimeout(() => {
        setPaymentStatus('authorized');
      }, 10000);

      return () => {
        clearTimeout(paymentTimer);
      };
    }
  }, [isVisible, eventId]);

  const handleCancel = () => {
    setPaymentStatus(null);
    setQrValue('');
    onClose();
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'authorized':
        return '#4CAF50';
      case 'expired':
        return '#FF9800';
      case 'invalid':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Waiting for payment...';
      case 'authorized':
        return 'Payment Successful!';
      case 'expired':
        return 'Payment Expired';
      case 'invalid':
        return 'Invalid Payment';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
            <X size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.amount}>${amount.toFixed(2)}</Text>
          
          <View style={styles.qrWrapper}>
            <View style={[styles.qrContainer, { borderColor: getStatusColor() }]}>
              {qrValue && (
                <QRCode
                  value={qrValue}
                  size={Dimensions.get('window').width * 0.7}
                  color="#000"
                  backgroundColor="#fff"
                />
              )}
            </View>

            {paymentStatus === 'authorized' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </View>

          <Text style={[styles.status, { color: getStatusColor() }]}>
            {getStatusMessage()}
          </Text>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: getStatusColor() }]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>
              {paymentStatus === 'authorized' ? 'Done' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  qrWrapper: {
    position: 'relative',
    marginBottom: 30,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 4,
  },
  checkmark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});