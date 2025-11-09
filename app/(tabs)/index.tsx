import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, Modal, Animated, Platform, Text, ImageSourcePropType, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Story } from '@/components/Story';
import { EventCard } from '@/components/EventCard';
import CameraView from '@/components/CameraView';
import EnhancedCameraView from '@/components/EnhancedCameraView';
import { PostModal } from '@/components/PostModal';
import { PostCreationScreen } from '@/components/PostCreationScreen';
import { usePosts } from '@/hooks/usePosts';
import { router } from 'expo-router';
import { useSafeToast } from '@/hooks/useErrorHandler';
import { ComponentErrorBoundary, ListItemErrorBoundary } from '@/components/ErrorBoundaries';
import { SkeletonHeader } from '@/components/SkeletonComponents';
import { SkeletonStory, SkeletonCard } from '@/components/LoadingStates';
import { useSimulatedLoading } from '@/hooks/useSkeletonLoader';
import { ScreenTransition } from '@/components/PageTransition';
import { smoothNavigation } from '@/utils/navigationTransitions';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { DynamicHeader } from '@/components/DynamicHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEvents } from '@/store/slices/eventsSlice';

const SAMPLE_STORIES = [
  { id: '1', title: 'Pub', image: require('@/assets/images/react-logo.png'), hasNewContent: true },
  { id: '2', title: 'Bar', image: require('@/assets/images/extra.png') },
  { id: '3', title: 'Venue', image: require('@/assets/images/splash-icon.png'), hasNewContent: true },
  { id: '4', title: 'Club', image: require('@/assets/images/adaptive-icon.png') },
];

export default function HomeScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [capturedMedia, setCapturedMedia] = useState<{
    uri: string;
    type: 'photo' | 'video';
  } | null>(null);
  
  const { showToast } = useSafeToast();
  const { createPost, isUploading } = usePosts();
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);
  const { theme } = useTheme();
  const colors = useThemeColors();
  
  const displayEvents = (events && events.length > 0
    ? events
    : [
        {
          id: 'sample-1',
          title: 'Sample Event',
          venue: 'Downtown Venue',
          time: 'Tonight 8:00 PM',
          image: require('@/assets/images/extra.png') as ImageSourcePropType,
          price: 19.99,
        },
        {
          id: 'sample-2',
          title: 'Another Event',
          venue: 'City Club',
          time: 'Fri 9:30 PM',
          image: require('@/assets/images/adaptive-icon.png') as ImageSourcePropType,
          price: 14.99,
        },
        {
          id: 'sample-3',
          title: 'Open Mic Night',
          venue: 'Studio Lounge',
          time: 'Sat 7:00 PM',
          image: require('@/assets/images/party1.jpg') as ImageSourcePropType,
          price: 9.99,
        },
        {
          id: 'sample-4',
          title: 'Live DJ',
          venue: 'Neon Bar',
          time: 'Sun 10:00 PM',
          image: require('@/assets/images/react-logo.png') as ImageSourcePropType,
          price: 12.0,
        },
        {
          id: 'sample-5',
          title: 'Acoustic Evening',
          venue: 'Riverside Cafe',
          time: 'Mon 6:30 PM',
          image: require('@/assets/images/PHOTO.png') as ImageSourcePropType,
          price: 7.5,
        },
        {
          id: 'sample-6',
          title: 'Comedy Night',
          venue: 'Brick House',
          time: 'Tue 8:30 PM',
          image: require('@/assets/images/partial-react-logo.png') as ImageSourcePropType,
          price: 11.0,
        },
      ]
  ).map((e: any) => ({
    id: e.id,
    title: e.title ?? e.name ?? 'Untitled',
    venue: e.venue ?? e.location ?? 'Unknown venue',
    time: e.time ?? e.date ?? '',
    image: e.image ?? require('@/assets/images/react-logo.png'),
    price: typeof e.price === 'number' ? e.price : 0,
  }));
  
  // Animation for header hide/show
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleStoryPress = (id: string) => {
    console.log('Story pressed:', id);
    if (id !== 'create') {
      const story = SAMPLE_STORIES.find(s => s.id === id);
      if (story) {
        alert(`Viewing story: ${story.title}`);
      }
    } else {
      setShowCamera(true);
    }
  };

  const handlePublishStory = (mediaUri: string) => {
    console.log('Published story with media:', mediaUri);
    setShowCamera(false);
    alert(`Story published with media: ${mediaUri}`);
  };

  const handlePostPress = () => {
    setShowPostModal(true);
  };

  const handleCameraPress = () => {
    setCameraMode('photo');
    setShowCamera(true);
  };

  const handleVideoPress = () => {
    setCameraMode('video');
    setShowCamera(true);
  };

  const handleGalleryPress = () => {
    showToast('Gallery selection completed! 📸', 'success');
  };

  const handleMediaCapture = (media: { uri: string; type: 'photo' | 'video' }) => {
    console.log('Media captured:', media);
    setCapturedMedia(media);
    setShowCamera(false);
    setShowPostCreation(true);
  };

  const handleCreatePost = async (postData: {
    caption: string;
    tags: string[];
    isPublic: boolean;
    saveToGallery: boolean;
  }) => {
    if (!capturedMedia) return;

    try {
      await createPost(capturedMedia.uri, capturedMedia.type, {
        caption: postData.caption,
        tags: postData.tags,
        isPublic: postData.isPublic,
        saveToGallery: postData.saveToGallery,
      });

      setShowPostCreation(false);
      setCapturedMedia(null);
      showToast(
        `${capturedMedia.type === 'photo' ? 'Photo' : 'Video'} posted successfully! 🎉`,
        'success'
      );
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Failed to create post. Please try again.', 'error');
    }
  };

  const handleClosePostCreation = () => {
    setShowPostCreation(false);
    setCapturedMedia(null);
  };

  const handleShare = (id: string) => {
    console.log('Share pressed:', id);
  };

  const handleDirections = (id: string) => {
    console.log('Directions pressed:', id);
  };

  const handleSave = (id: string) => {
    console.log('Save pressed:', id);
  };

  const handleBook = (id: string) => {
    console.log('Book pressed:', id);
    showToast('Event booked successfully! 🎉', 'success');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <DynamicHeader scrollY={scrollY} onPostPress={handlePostPress} />
        <FlatList
          data={[1, 2, 3]} // Dummy data for loading skeletons
          keyExtractor={(item) => `skeleton-${item}`}
          ListHeaderComponent={() => <SkeletonStory />}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={{ paddingTop: 100 }}
        />
      </SafeAreaView>
    );
  }

  // Render content even if events error, showing a friendly banner instead of blank screen

  return (
    <ScreenTransition transitionType="slideUp" duration={300}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <DynamicHeader scrollY={scrollY} onPostPress={handlePostPress} />
        
        <Animated.FlatList
          data={displayEvents}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={() => (
            <ComponentErrorBoundary componentName="Story">
              <Story stories={SAMPLE_STORIES} onStoryPress={handleStoryPress} />
            </ComponentErrorBoundary>
          )}
          renderItem={({ item: event }: { item: any }) => (
            <ListItemErrorBoundary key={event.id} itemId={event.id}>
              <EventCard
                event={event}
                onShare={handleShare}
                onDirections={handleDirections}
                onSave={handleSave}
                onBook={handleBook}
                onPress={(id) => router.push({ pathname: '/event-details', params: { id } })}
              />
            </ListItemErrorBoundary>
          )}
          contentContainerStyle={{ paddingTop: 100 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />

        {/* Post Modal */}
        <PostModal
          visible={showPostModal}
          onClose={() => setShowPostModal(false)}
          onCameraPress={handleCameraPress}
          onVideoPress={handleVideoPress}
          onGalleryPress={handleGalleryPress}
        />

        {/* Enhanced Camera Modal */}
        <Modal
          visible={showCamera}
          animationType="slide"
          onRequestClose={() => setShowCamera(false)}
        >
          <EnhancedCameraView 
            mode={cameraMode}
            onClose={() => setShowCamera(false)}
            onCapture={handleMediaCapture}
          />
        </Modal>

        {/* Post Creation Modal */}
        <Modal
          visible={showPostCreation}
          animationType="slide"
          onRequestClose={handleClosePostCreation}
        >
          {capturedMedia && (
            <PostCreationScreen
              mediaUri={capturedMedia.uri}
              mediaType={capturedMedia.type}
              onClose={handleClosePostCreation}
              onPost={handleCreatePost}
            />
          )}
        </Modal>
      </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
