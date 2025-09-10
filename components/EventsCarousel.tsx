import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Calendar } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SkeletonCard } from './LoadingStates';
import { useSimulatedLoading } from '@/hooks/useSkeletonLoader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = 10;

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  isPast?: boolean;
  image?: any; // Added image property to support both URI and require()
}

interface EventCardProps {
  event: Event;
  index: number;
}

const EventCard: React.FC<EventCardProps & { navigation: any }> = ({ event, index, navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    // Navigate to event details screen with event data
    navigation.navigate('EventDetails', { event });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Calendar size={20} color={isDark ? '#ffffff' : '#000000'} />
          <ThemedText style={styles.date}>{event.date}</ThemedText>
        </View>
        <ThemedText style={styles.title}>{event.title}</ThemedText>
        <ThemedText style={styles.location}>{event.location}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

interface CarouselProps {
  upcomingEvents: Event[];
  pastEvents: Event[];
  navigation: any;
}

export const EventsCarousel: React.FC<CarouselProps> = ({ upcomingEvents, pastEvents, navigation }) => {
  const { isLoading } = useSimulatedLoading(1200);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.sectionTitle, { height: 24, backgroundColor: '#333', borderRadius: 4 }]} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
        
        <View style={[styles.sectionTitle, styles.pastEventsTitle, { height: 24, backgroundColor: '#333', borderRadius: 4 }]} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Upcoming Events</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
      >
        {upcomingEvents.map((event, index) => (
          <EventCard 
            key={event.id} 
            event={event} navigation={navigation}
            index={index} 
          />
        ))}
      </ScrollView>

      <ThemedText style={[styles.sectionTitle, styles.pastEventsTitle]}>Past Events</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
      >
        {pastEvents.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} navigation={navigation} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  pastEventsTitle: {
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
  },
  card: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },
  date: {
    fontSize: 14,
    opacity: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
  },
});