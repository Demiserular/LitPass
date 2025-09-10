import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface StoryRecord {
  id: string;
  title?: string;
  image?: string;
  hasNewContent?: boolean;
}

export function useStories() {
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*');
          
        if (error) throw error;
        setStories((data as StoryRecord[]) || []);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load stories');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStories();
  }, []);

  return { stories, loading, error };
}