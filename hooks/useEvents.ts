import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface EventRecord {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  start_time: string;
  end_time: string | null;
  cover_image_url: string | null;
  price: number;
  capacity: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  distance?: number; // For location-based sorting
}

interface UseEventsOptions {
  limit?: number;
  searchQuery?: string;
  sortBy?: 'date' | 'distance' | 'price';
  ascending?: boolean;
  userId?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const pageSize = options.limit || 10;

  const fetchEvents = useCallback(async (page = 0, reset = false) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' });

      // Apply search query if provided
      if (options.searchQuery) {
        query = query.ilike('title', `%${options.searchQuery}%`);
      }

      // Apply sorting
      if (options.sortBy === 'date') {
        query = query.order('start_time', { ascending: options.ascending ?? false });
      } else if (options.sortBy === 'price') {
        query = query.order('price', { ascending: options.ascending ?? true });
      } else {
        // Default sorting by creation date
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setEvents(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setHasMore((data?.length || 0) >= pageSize);
      setPage(page);
      
      return { data, count };
    } catch (e: any) {
      console.error('Error fetching events:', e);
      setError(e?.message ?? 'Failed to load events');
      return { data: null, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [options.searchQuery, options.sortBy, options.ascending, pageSize]);

  const refresh = useCallback(() => {
    return fetchEvents(0, true);
  }, [fetchEvents]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      return fetchEvents(page + 1, false);
    }
    return Promise.resolve({ data: null, count: 0 });
  }, [fetchEvents, hasMore, loading, page]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [options.searchQuery, options.sortBy, options.ascending]);

  return { 
    events, 
    loading, 
    error, 
    refresh, 
    loadMore, 
    hasMore,
    page: page + 1,
    pageSize 
  };
}

// Hook to fetch a single event
export function useEvent(eventId: string) {
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (error) throw error;
        setEvent(data as EventRecord);
      } catch (e: any) {
        console.error('Error fetching event:', e);
        setError(e?.message ?? 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }
    
    if (eventId) {
      fetchEvent();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  return { event, loading, error };
}