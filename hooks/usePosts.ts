import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export interface Post {
  id: string;
  type: 'photo' | 'video';
  uri: string;
  caption?: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[];
  isPublic: boolean;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createPost = useCallback(async (
    mediaUri: string,
    type: 'photo' | 'video',
    options?: {
      caption?: string;
      location?: Post['location'];
      tags?: string[];
      isPublic?: boolean;
      saveToGallery?: boolean;
    }
  ): Promise<Post> => {
    setIsUploading(true);
    
    try {
      // Save to device gallery if requested
      if (options?.saveToGallery) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(mediaUri);
        }
      }

      // Create post object
      const newPost: Post = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        uri: mediaUri,
        caption: options?.caption,
        timestamp: Date.now(),
        location: options?.location,
        tags: options?.tags || [],
        isPublic: options?.isPublic ?? true,
      };

      // Add to posts list
      setPosts(prevPosts => [newPost, ...prevPosts]);

      // Here you would typically upload to your backend
      // await uploadToServer(newPost);

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Show confirmation dialog
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Remove from posts list
              setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

              // Here you would typically delete from your backend
              // await deleteFromServer(postId);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    }
  }, [posts]);

  const updatePost = useCallback(async (
    postId: string,
    updates: Partial<Omit<Post, 'id' | 'timestamp'>>
  ) => {
    try {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, ...updates } : post
        )
      );

      // Here you would typically update on your backend
      // await updateOnServer(postId, updates);
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post');
    }
  }, []);

  const getPostsByType = useCallback((type: 'photo' | 'video') => {
    return posts.filter(post => post.type === type);
  }, [posts]);

  const getPublicPosts = useCallback(() => {
    return posts.filter(post => post.isPublic);
  }, [posts]);

  return {
    posts,
    isUploading,
    createPost,
    deletePost,
    updatePost,
    getPostsByType,
    getPublicPosts,
  };
}