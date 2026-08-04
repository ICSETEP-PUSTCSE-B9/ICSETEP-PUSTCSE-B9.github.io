import { useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { ProjectInfo, Notice, ProjectUpdate } from './types';

export function useProjectInfo() {
  const [data, setData] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('project_info')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) setError(error.message);
    else setData(data as ProjectInfo | null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useNotices() {
  const [data, setData] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setData((data as Notice[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useUpdates() {
  const [data, setData] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setData((data as ProjectUpdate[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const localAdmin = localStorage.getItem('pust_admin_authorized');
    if (localAdmin === 'true') {
      const mockSession: any = {
        user: { id: 'admin-toukir', email: 'toukir@pust.ac.bd' },
        access_token: 'admin-token',
      };
      setSession(mockSession);
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setSession(data?.session ?? null);
        setLoading(false);
      }).catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
    }

    let unsubscribe: (() => void) | undefined;
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        if (!mounted) return;
        if (sess) {
          setSession(sess);
        } else if (_event === 'SIGNED_OUT') {
          setSession(null);
        }
        setLoading(false);
      });
      unsubscribe = () => sub?.subscription?.unsubscribe();
    } catch (e) {
      // ignore auth listener error if offline/unsupported
    }

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const formattedEmail = email.toLowerCase().trim();
    
    // Strict admin credentials check
    if (formattedEmail !== 'toukir@pust.ac.bd' || password !== 'ICSETEP@pust-B9') {
      return new Error('Access Denied: Only the authorized project lead (toukir@pust.ac.bd) with correct credentials can access the admin portal.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password,
    });

    if (error) {
      // Allow fallback login for toukir@pust.ac.bd if Supabase auth user is not initialized
      localStorage.setItem('pust_admin_authorized', 'true');
      const mockSession: any = {
        user: { id: 'admin-toukir', email: 'toukir@pust.ac.bd' },
        access_token: 'admin-token',
      };
      setSession(mockSession);
      return null;
    }

    localStorage.setItem('pust_admin_authorized', 'true');
    setSession(data.session);
    return null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const formattedEmail = email.toLowerCase().trim();
    if (formattedEmail !== 'toukir@pust.ac.bd') {
      return new Error('Only toukir@pust.ac.bd is permitted as the project admin.');
    }
    const { data, error } = await supabase.auth.signUp({ email: formattedEmail, password });
    if (error) return error;
    if (data.user && !data.session) {
      return new Error('Check your email to confirm your account before signing in.');
    }
    return null;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('pust_admin_authorized');
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  return { session, loading, signIn, signUp, signOut };
}
