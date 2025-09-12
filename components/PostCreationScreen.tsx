import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { 
  X, 
  MapPin, 
  Hash, 
  Globe, 
  Lock, 
  Save,
  Share2,
  Camera
} from 'lucide-react-native';
import { useTheme, useThemeColors } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface PostCreationScreenProps {
  mediaUri: string;
  mediaType: 'photo' | 'video';
  onClose: () => void;
  onPost: (postData: {
    caption: string;
    tags: string[];
    isPublic: boolean;
    saveToGallery: boolean;
  }) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PostCreationScreen({
  mediaUri,
  mediaType,
  onClose,
  onPost,
}: PostCreationScreenProps) {
  const { theme } = useTheme();
  const colors = useThemeColors();
  
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (isPosting) return;

    try {
      setIsPosting(true);
      
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Parse tags from string
      const tagArray = tags
        .split(/[,\s]+/)
        .map(tag => tag.trim().replace(/^#/, ''))
        .filter(tag => tag.length > 0);

      const postData = {
        caption: caption.trim(),
        tags: tagArray,
        isPublic,
        saveToGallery,
      };

      await onPost(postData);
    } catch (error) {
      console.error('Error posting:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleTagsChange = (text: string) => {
    // Auto-add # for hashtags
    const formattedText = text
      .split(/\s+/)
      .map(word => {
        if (word.length > 0 && !word.startsWith('#') && word.match(/^[a-zA-Z]/)) {
          return `#${word}`;
        }
        return word;
      })
      .join(' ');
    
    setTags(formattedText);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          New Post
        </Text>
        
        <TouchableOpacity 
          onPress={handlePost}
          style={[
            styles.postButton,
            { 
              backgroundColor: colors.accent,
              opacity: isPosting ? 0.6 : 1,
            }
          ]}
          disabled={isPosting}
        >
          <Text style={styles.postButtonText}>
            {isPosting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Media Preview */}
        <View style={styles.mediaContainer}>
          {mediaType === 'photo' ? (
            <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
          ) : (
            <View style={[styles.videoPreview, { backgroundColor: colors.tertiaryBackground }]}>
              <Camera size={48} color={colors.secondaryText} />
              <Text style={[styles.videoText, { color: colors.secondaryText }]}>
                Video Ready
              </Text>
            </View>
          )}
        </View>

        {/* Caption Input */}
        <View style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
          <TextInput
            style={[styles.captionInput, { color: colors.text }]}
            placeholder="Write a caption..."
            placeholderTextColor={colors.secondaryText}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
            {caption.length}/500
          </Text>
        </View>

        {/* Tags Input */}
        <View style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.sectionHeader}>
            <Hash size={20} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tags
            </Text>
          </View>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Add tags (e.g., #party #music #fun)"
            placeholderTextColor={colors.secondaryText}
            value={tags}
            onChangeText={handleTagsChange}
            autoCapitalize="none"
          />
        </View>

        {/* Privacy Settings */}
        <View style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                {isPublic ? (
                  <Globe size={20} color={colors.accent} />
                ) : (
                  <Lock size={20} color={colors.accent} />
                )}
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  {isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
              <Text style={[styles.settingDescription, { color: colors.secondaryText }]}>
                {isPublic 
                  ? 'Anyone can see this post'
                  : 'Only you can see this post'
                }
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: colors.separator, true: colors.accent }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.background}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Save size={20} color={colors.accent} />
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Save to Gallery
                </Text>
              </View>
              <Text style={[styles.settingDescription, { color: colors.secondaryText }]}>
                Save a copy to your device
              </Text>
            </View>
            <Switch
              value={saveToGallery}
              onValueChange={setSaveToGallery}
              trackColor={{ false: colors.separator, true: colors.accent }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.background}
            />
          </View>
        </View>

        {/* Additional Options */}
        <View style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
          <TouchableOpacity style={styles.optionRow}>
            <MapPin size={20} color={colors.accent} />
            <Text style={[styles.optionText, { color: colors.text }]}>
              Add Location
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionRow}>
            <Share2 size={20} color={colors.accent} />
            <Text style={[styles.optionText, { color: colors.text }]}>
              Share to Other Apps
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mediaContainer: {
    padding: 16,
    alignItems: 'center',
  },
  mediaPreview: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 1.2,
    borderRadius: 12,
  },
  videoPreview: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 1.2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: 14,
    marginLeft: 28,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});