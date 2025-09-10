import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useEvent } from './useEvents';

export interface TicketRecord {
  id: string;
  event_id: string;
  user_id: string;
  ticket_number: string;
  status: 'active' | 'used' | 'cancelled';
  qr_code: string | null;
  created_at: string;
  updated_at: string;
  event?: {
    title: string;
    start_time: string;
    venue: string | null;
    cover_image_url: string | null;
  };
}

interface UseTicketsOptions {
  includeEventDetails?: boolean;
  status?: 'active' | 'used' | 'cancelled';
  limit?: number;
}

export function useTickets(userId: string, options: UseTicketsOptions = {}) {
  const { includeEventDetails = false, status, limit } = options;
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const pageSize = limit || 10;

  const fetchTickets = useCallback(async (page = 0, reset = false) => {
    if (!userId) return { data: null, count: 0 };
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('tickets')
        .select(
          includeEventDetails 
            ? '*, event:events!inner(title, start_time, venue, cover_image_url)' 
            : '*',
          { count: 'exact' }
        )
        .eq('user_id', userId);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      // Pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.order('created_at', { ascending: false })
                  .range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setTickets(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setHasMore((data?.length || 0) >= pageSize);
      setPage(page);
      
      return { data, count };
    } catch (e: any) {
      console.error('Error fetching tickets:', e);
      setError(e?.message ?? 'Failed to load tickets');
      return { data: null, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [userId, status, pageSize, includeEventDetails]);
  
  const refresh = useCallback(() => {
    return fetchTickets(0, true);
  }, [fetchTickets]);
  
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      return fetchTickets(page + 1, false);
    }
    return Promise.resolve({ data: null, count: 0 });
  }, [fetchTickets, hasMore, loading, page]);
  
  // Initial fetch
  useEffect(() => {
    refresh();
  }, [userId, status]);
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel('tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Ticket change received!', payload);
          refresh();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, refresh]);
  
  // Function to mark ticket as used
  const markAsUsed = useCallback(async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'used',
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      // Refresh the tickets list
      await refresh();
      return true;
    } catch (e: any) {
      console.error('Error marking ticket as used:', e);
      setError(e?.message ?? 'Failed to update ticket status');
      return false;
    }
  }, [refresh]);
  
  // Function to cancel a ticket
  const cancelTicket = useCallback(async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId)
        .eq('status', 'active'); // Only cancel active tickets
      
      if (error) throw error;
      
      // Refresh the tickets list
      await refresh();
      return true;
    } catch (e: any) {
      console.error('Error cancelling ticket:', e);
      setError(e?.message ?? 'Failed to cancel ticket');
      return false;
    }
  }, [refresh]);
  
  return { 
    tickets, 
    loading, 
    error, 
    refresh, 
    loadMore, 
    hasMore,
    markAsUsed,
    cancelTicket,
    page: page + 1,
    pageSize 
  };
}

// Hook to get a single ticket by ID
export function useTicket(ticketId: string) {
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { event, loading: eventLoading } = useEvent(
    ticket?.event_id || '',
    { skip: !ticket?.event_id }
  );
  
  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (error) throw error;
      setTicket(data);
    } catch (e: any) {
      console.error('Error fetching ticket:', e);
      setError(e?.message ?? 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);
  
  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, fetchTicket]);
  
  return { 
    ticket: ticket ? { ...ticket, event } : null, 
    loading: loading || eventLoading, 
    error,
    refresh: fetchTicket
  };
}

// Hook to get tickets for an event
export function useEventTickets(eventId: string, options: Omit<UseTicketsOptions, 'includeEventDetails'> = {}) {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId);
      
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setTickets(data || []);
    } catch (e: any) {
      console.error('Error fetching event tickets:', e);
      setError(e?.message ?? 'Failed to load event tickets');
    } finally {
      setLoading(false);
    }
  }, [eventId, options.status]);
  
  useEffect(() => {
    if (eventId) {
      fetchTickets();
    }
  }, [eventId, fetchTickets]);
  
  return { tickets, loading, error, refresh: fetchTickets };
}