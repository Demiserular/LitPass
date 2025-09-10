import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface TransactionRecord {
  id: string;
  user_id: string;
  event_id: string | null;
  ticket_id: string | null;
  amount: number;
  status: TransactionStatus;
  payment_method: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  event?: {
    title: string;
    cover_image_url: string | null;
  };
}

interface UseTransactionsOptions {
  status?: TransactionStatus;
  limit?: number;
  includeEventDetails?: boolean;
}

export function useTransactions(userId: string, options: UseTransactionsOptions = {}) {
  const { status, limit = 20, includeEventDetails = false } = options;
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const pageSize = limit;

  const fetchTransactions = useCallback(async (page = 0, reset = false) => {
    if (!userId) return { data: null, count: 0 };
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('transactions')
        .select(
          includeEventDetails
            ? '*, event:events!inner(title, cover_image_url)'
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
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setTransactions(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setHasMore((data?.length || 0) >= pageSize);
      setPage(page);
      
      return { data, count };
    } catch (e: any) {
      console.error('Error fetching transactions:', e);
      setError(e?.message ?? 'Failed to load transactions');
      return { data: null, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [userId, status, pageSize, includeEventDetails]);
  
  const refresh = useCallback(() => {
    return fetchTransactions(0, true);
  }, [fetchTransactions]);
  
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      return fetchTransactions(page + 1, false);
    }
    return Promise.resolve({ data: null, count: 0 });
  }, [fetchTransactions, hasMore, loading, page]);
  
  // Initial fetch
  useEffect(() => {
    refresh();
  }, [userId, status]);
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Transaction change received!', payload);
          refresh();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, refresh]);
  
  // Create a new transaction
  const createTransaction = useCallback(async (transaction: {
    amount: number;
    event_id?: string;
    ticket_id?: string;
    payment_method: string;
    payment_id: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...transaction,
            user_id: userId,
            status: 'pending',
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh the transactions list
      await refresh();
      return data;
    } catch (e: any) {
      console.error('Error creating transaction:', e);
      setError(e?.message ?? 'Failed to create transaction');
      return null;
    }
  }, [userId, refresh]);
  
  // Update transaction status
  const updateTransactionStatus = useCallback(async (transactionId: string, status: TransactionStatus) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', transactionId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh the transactions list
      await refresh();
      return data;
    } catch (e: any) {
      console.error('Error updating transaction:', e);
      setError(e?.message ?? 'Failed to update transaction');
      return null;
    }
  }, [refresh]);
  
  return { 
    transactions, 
    loading, 
    error, 
    refresh, 
    loadMore, 
    hasMore,
    createTransaction,
    updateTransactionStatus,
    page: page + 1,
    pageSize 
  };
}

// Hook to get a single transaction by ID
export function useTransaction(transactionId: string) {
  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTransaction = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*, event:events!inner(title, cover_image_url)')
        .eq('id', transactionId)
        .single();
      
      if (error) throw error;
      setTransaction(data);
    } catch (e: any) {
      console.error('Error fetching transaction:', e);
      setError(e?.message ?? 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  }, [transactionId]);
  
  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, fetchTransaction]);
  
  return { 
    transaction, 
    loading, 
    error,
    refresh: fetchTransaction
  };
}