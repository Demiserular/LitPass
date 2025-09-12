import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Share2, MapPin, Bookmark } from 'lucide-react-native';
import { VenueMapView } from './MapView';
import { PaymentView } from './PaymentView';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';

type EventCardProps = {
  event: {
    id: string;
    title?: string;
    venue?: string;
    time?: string;
    image?: any;
    price?: number;
  };
  onShare: (id: string) => void;
  onDirections: (id: string) => void;
  onSave: (id: string) => void;
  onBook: (id: string) => void;
  onPress?: (id: string) => void;
};

export function EventCard({ event, onShare, onDirections, onSave, onBook, onPress }: EventCardProps) {
  const [showMap, setShowMap] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { theme } = useTheme();
  const colors = useThemeColors();

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.secondaryBackground }
    ]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress && onPress(event.id)}>
        {event.image ? (
          <Image source={typeof event.image === 'string' ? { uri: event.image } : event.image} style={styles.image} transition={300} />
        ) : null}
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        {event.title ? <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text> : null}
        <View style={styles.venueContainer}>
          {event.venue ? <Text style={[styles.venue, { color: colors.secondaryText }]}>{event.venue}</Text> : null}
          {event.time ? <Text style={[styles.time, { color: colors.secondaryText }]}>{event.time}</Text> : null}
        </View>
      </View>

      <View style={[
        styles.actionsContainer,
        { borderTopColor: colors.separator }
      ]}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(event.id)}>
            <Share2 size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowMap(true)}>
            <MapPin size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Directions</Text>
          </TouchableOpacity>

          <Modal
            visible={showMap}
            animationType="slide"
            onRequestClose={() => setShowMap(false)}
          >
            <VenueMapView onClose={() => setShowMap(false)} />
          </Modal>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSave(event.id)}>
            <Bookmark size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            { backgroundColor: colors.primary }
          ]}
          onPress={() => setShowPayment(true)}>
          <Text style={[styles.price, { color: '#fff' }]}>${(event.price ?? 0).toFixed(2)}</Text>
          <Text style={[styles.bookText, { color: '#fff' }]}>Book Now</Text>
        </TouchableOpacity>

        <PaymentView
          isVisible={showPayment}
          onClose={() => {
            setShowPayment(false);
            onBook(event.id);
          }}
          eventId={event.id}
          amount={event.price ?? 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  venueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venue: {
    fontSize: 14,
    fontWeight: '500',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 15,
    borderTopWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});