import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { useProfile, Profile } from './useProfile';

export interface AuthUser extends User {
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
    full_name?: string;
  };
  profile?: Profile;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get user profile if user is authenticated
  const { profile, loading: profileLoading } = useProfile(user?.id || '');
  
  // Update user with profile data when it's loaded
  useEffect(() => {
    if (user && profile) {
      setUser(prev => prev ? { ...prev, profile } : null);
    }
  }, [profile]);
  
  // Check for existing session on mount
  useEffect(() => {
    // Get the current session if it exists
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user as AuthUser | null);
        setLoading(false);
      }
    );
    
    // Initial session check
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user as AuthUser | null);
      } catch (e: any) {
        console.error('Error getting initial session:', e);
        setError(e?.message ?? 'Failed to check authentication status');
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with email and password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { user: data.user as AuthUser, session: data.session };
    } catch (e: any) {
      console.error('Error signing in:', e);
      setError(e?.message ?? 'Failed to sign in');
      return { user: null, session: null, error: e };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sign up with email and password
  const signUpWithEmail = useCallback(async (email: string, password: string, userData: { full_name: string; username: string }) => {
    try {
      setLoading(true);
      
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username,
          },
        },
      });
      
      if (error) throw error;
      
      // The user profile will be created by the database trigger
      return { user: data.user as AuthUser, session: data.session };
    } catch (e: any) {
      console.error('Error signing up:', e);
      setError(e?.message ?? 'Failed to sign up');
      return { user: null, session: null, error: e };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      return { url: data.url };
    } catch (e: any) {
      console.error(`Error signing in with ${provider}:`, e);
      setError(e?.message ?? `Failed to sign in with ${provider}`);
      return { url: null, error: e };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setSession(null);
      setUser(null);
      
      return { success: true };
    } catch (e: any) {
      console.error('Error signing out:', e);
      setError(e?.message ?? 'Failed to sign out');
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Send password reset email
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (e: any) {
      console.error('Error sending password reset email:', e);
      setError(e?.message ?? 'Failed to send password reset email');
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update user password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (e: any) {
      console.error('Error updating password:', e);
      setError(e?.message ?? 'Failed to update password');
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          username: updates.username,
        },
      });
      
      if (authError) throw authError;
      
      // Update the user state with the new data
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            full_name: updates.full_name,
            name: updates.full_name,
          },
          profile: prev.profile ? { ...prev.profile, ...updates } : undefined,
        };
      });
      
      return { success: true };
    } catch (e: any) {
      console.error('Error updating profile:', e);
      setError(e?.message ?? 'Failed to update profile');
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  return {
    session,
    user,
    profile: user?.profile || null,
    loading: loading || profileLoading,
    error,
    isAuthenticated: !!session,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };
}

// Hook to get the current user
export function useUser() {
  const { user, loading, error } = useAuth();
  return { user, loading, error };
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
}

// Hook to get the current session
export function useSession() {
  const { session, loading, error } = useAuth();
  return { session, loading, error };
}
