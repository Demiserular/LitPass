import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface ProfileRecord {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        setProfile((data as ProfileRecord) || null);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return { profile, loading, error };
}