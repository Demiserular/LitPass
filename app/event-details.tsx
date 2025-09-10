import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Share, 
  Animated, 
  Dimensions, 
  Easing, 
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Modal,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColors } from '@/contexts/ThemeContext';
import { MapPin, Share2, Bookmark, ArrowLeft, AlertCircle } from 'lucide-react-native';
import { VenueMapView } from '@/components/MapView';
import { PaymentView } from '@/components/PaymentView';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEventById, selectCurrentEvent, clearCurrentEvent } from '@/store/slices/eventsSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EventData {
  id: string;
  title: string;
  venue: string;
  time: string;
  start_time: string;
  price: number;
  description: string;
  image: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Fallback data in case the event is not found in the store
const FALLBACK_EVENTS: Record<string, EventData> = {
  'sample-1': {
    id: 'sample-1',
    title: 'Sample Event',
    venue: 'Downtown Venue',
    time: 'Tonight 8:00 PM',
    start_time: new Date().toISOString(),
    price: 19.99,
    description: 'Join us for an unforgettable night with live music, great food, and amazing vibes.',
    image: 'https://example.com/sample-event.jpg',
    cover_image_url: 'https://example.com/sample-event-cover.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
  },
  'sample-2': {
    id: 'sample-2',
    title: 'Acoustic Night',
    venue: 'Riverside Cafe',
    time: 'Tomorrow 7:00 PM',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    price: 7.5,
    description: 'Relax with soothing acoustic performances by the river.',
    image: require('@/assets/images/PHOTO.png'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
  },
  'sample-6': {
    id: 'sample-6',
    title: 'Comedy Night',
    venue: 'Brick House',
    time: 'Tue 8:30 PM',
    start_time: new Date(Date.now() + 2 * 86400000).toISOString(),
    price: 11.0,
    description: 'Laugh out loud with stand-up acts from local comedians.',
    image: require('@/assets/images/partial-react-logo.png'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
  }
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  
  // Select event data from Redux store
  const event = useAppSelector(selectCurrentEvent);
  const loading = useAppSelector(state => state.events.loading);
  const error = useAppSelector(state => state.events.error);
  
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0.1)).current;
  const [showMap, setShowMap] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Fetch event data when component mounts or id changes
  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
    
    // Cleanup function to clear current event when component unmounts
    return () => {
      dispatch(clearCurrentEvent());
    };
  }, [id, dispatch]);
  
  // Use fallback data if event is not found
  const displayEvent: EventData = event ?? FALLBACK_EVENTS[id as string] ?? FALLBACK_EVENTS['sample-1'];

  const handleBack = useCallback(() => {
    // Instagram-style vertical slide down
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease)
    }).start(() => {
      router.back();
    });
  }, [router, slideAnim]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out this event: ${displayEvent.title} at ${displayEvent.venue}`,
        url: `https://litpass.app/event/${id}`,
        title: displayEvent.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [displayEvent, id]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    // TODO: Save bookmark to database using Redux action
  }, [isBookmarked]);

  // Set up the initial animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 15,
    }).start();
  }, [slideAnim]);

  // Set up the initial animation value when component mounts
  useEffect(() => {
    // Start from slightly below (Instagram-style)
    slideAnim.setValue(0.1);
    // Smooth fade in from bottom
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 15,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50],
                extrapolate: 'clamp',
              })
            }],
            opacity: slideAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.9, 0.7],
              extrapolate: 'clamp',
            }),
            flex: 1,
          }
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View>
              <View style={styles.headerImageContainer}>
                {displayEvent?.image ? (
                  <Image 
                    source={typeof displayEvent.image === 'string' 
                      ? { uri: displayEvent.image } 
                      : displayEvent.image} 
                    style={styles.image}
                    resizeMode="cover"
                    onError={(error: any) => console.log('Image load error:', error.nativeEvent.error)}
                  />
                ) : (
                  <View style={[styles.image, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
                    <ThemedText style={{ color: '#666' }}>No Image Available</ThemedText>
                  </View>
                )}
                <View style={[styles.headerOverlay, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />
              </View>
              
              <View style={styles.headerTopBar}>
                <TouchableOpacity style={styles.headerActionsLeft} onPress={handleBack}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <ArrowLeft color="#fff" size={20} />
                  </View>
                </TouchableOpacity>
                <View style={styles.headerActionsRight}>
                  <TouchableOpacity onPress={handleBookmark}>
                    <View style={[styles.iconCircle, { backgroundColor: isBookmarked ? '#007AFF' : 'rgba(0,0,0,0.6)' }]}>
                      <Bookmark 
                        color="#fff"
                        size={20} 
                        fill={isBookmarked ? '#fff' : 'transparent'}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleShare}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                      <Share2 color="#fff" size={20} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.headerBottomInfo}>
                <ThemedText style={styles.headerTitle}>{displayEvent?.title}</ThemedText>
                <View style={styles.subRow}>
                  <MapPin size={16} color="#fff" />
                  <ThemedText style={styles.headerSubtitle}>{displayEvent?.venue}</ThemedText>
                </View>
              </View>
            </View>

            <ThemedView style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
              <ThemedText style={styles.paragraph}>{event?.description || 'No description available'}</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Details</ThemedText>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Venue</ThemedText>
                <ThemedText style={styles.detailValue}>{event?.venue || 'N/A'}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Time</ThemedText>
                <ThemedText style={styles.detailValue}>{event?.time || 'N/A'}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Price</ThemedText>
                <ThemedText style={styles.detailValue}>${event?.price?.toFixed(2) || '0.00'}</ThemedText>
              </View>
            </ThemedView>

            <View style={styles.inlineActions}>
              <TouchableOpacity 
                style={[styles.inlineButton, { backgroundColor: colors.primary }]} 
                onPress={() => setShowPayment(true)}
              >
                <ThemedText style={styles.inlineButtonText}>Book Now</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.inlineButton, { backgroundColor: colors.tertiaryBackground }]} 
                onPress={() => setShowMap(true)}
              >
                <ThemedText style={[styles.inlineButtonText, { color: colors.text }]}>
                  View Location
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
            <VenueMapView onClose={() => setShowMap(false)} />
          </Modal>

          <PaymentView
            isVisible={showPayment}
            onClose={() => setShowPayment(false)}
            eventId={id}
            amount={event?.price || 0}
          />
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  headerImageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerActionsLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBottomInfo: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    marginTop: 8,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  inlineButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});


