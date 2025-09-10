import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface WalletRecord {
  id: string;
  user_id: string;
  balance: number;
  coins: number;
}

export function useWallet(userId: string) {
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWallet() {
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error) throw error;
        setWallet((data as WalletRecord) || null);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load wallet');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchWallet();
    }
  }, [userId]);

  return { wallet, loading, error };
}