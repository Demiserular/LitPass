import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (e: any) {
      console.error('Error fetching profile:', e);
      setError(e?.message ?? 'Failed to load profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile?.id) return null;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (e: any) {
      console.error('Error updating profile:', e);
      setError(e?.message ?? 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!profile?.id) return null;
    
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return await updateProfile({ avatar_url: publicUrl });
    } catch (e: any) {
      console.error('Error uploading avatar:', e);
      setError(e?.message ?? 'Failed to upload avatar');
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, updateProfile]);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh: () => userId ? fetchProfile(userId) : Promise.resolve(null),
    updateProfile,
    uploadAvatar,
  };
}

export function useCurrentUserProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    getCurrentUser();
    
    const { data: { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return useProfile(userId || undefined);
}
