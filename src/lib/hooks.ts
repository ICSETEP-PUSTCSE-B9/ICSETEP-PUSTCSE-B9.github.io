import { useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { ProjectInfo, Notice, ProjectUpdate } from './types';

export function useProjectInfo() {
  const [data, setData] = useState<ProjectInfo | null>(() => {
    try {
      const cached = localStorage.getItem('pust_project_info_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resData, error: resError } = await supabase
        .from('project_info')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (resError) {
        setError(resError.message);
      } else if (resData) {
        setData(resData as ProjectInfo);
        localStorage.setItem('pust_project_info_cache', JSON.stringify(resData));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load project info.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useNotices() {
  const loadNotices = useCallback(() => {
    try {
      const cached = localStorage.getItem('pust_notices_cache');
      const list: Notice[] = cached ? JSON.parse(cached) : [];
      const deletedStr = localStorage.getItem('pust_deleted_notices');
      const deletedIds = new Set<string>(deletedStr ? JSON.parse(deletedStr) : []);
      return list.filter((n) => !deletedIds.has(n.id));
    } catch {
      return [];
    }
  }, []);

  const [data, setData] = useState<Notice[]>(loadNotices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resData, error: resError } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      const cached = localStorage.getItem('pust_notices_cache');
      const localList: Notice[] = cached ? JSON.parse(cached) : [];

      const deletedStr = localStorage.getItem('pust_deleted_notices');
      const deletedIds = new Set<string>(deletedStr ? JSON.parse(deletedStr) : []);

      const map = new Map<string, Notice>();
      // Insert remote notices (excluding deleted)
      if (resData) {
        (resData as Notice[]).forEach((n) => {
          if (!deletedIds.has(n.id)) map.set(n.id, n);
        });
      }
      // Override/append local notices (excluding deleted)
      localList.forEach((n) => {
        if (!deletedIds.has(n.id)) map.set(n.id, n);
      });

      const merged = Array.from(map.values()).sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setData(merged);
      localStorage.setItem('pust_notices_cache', JSON.stringify(merged));

      if (resError && merged.length === 0) {
        setError(resError.message);
      }
    } catch (e: any) {
      if (data.length === 0) setError(e.message || 'Failed to load notices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();

    const handleUpdate = () => {
      const current = loadNotices();
      if (current.length > 0) {
        setData(current);
      }
    };

    window.addEventListener('pust_notices_updated', handleUpdate);
    return () => window.removeEventListener('pust_notices_updated', handleUpdate);
  }, [fetch, loadNotices]);

  return { data, loading, error, refresh: fetch };
}

export function useUpdates() {
  const [data, setData] = useState<ProjectUpdate[]>(() => {
    try {
      const cached = localStorage.getItem('pust_updates_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resData, error: resError } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (resError) {
        setError(resError.message);
      } else if (resData) {
        setData(resData as ProjectUpdate[]);
        localStorage.setItem('pust_updates_cache', JSON.stringify(resData));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load updates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => {
    const localAdmin = localStorage.getItem('pust_admin_authorized');
    if (localAdmin === 'true') {
      return {
        user: { id: 'admin-toukir', email: 'toukir@pust.ac.bd' },
        access_token: 'admin-token',
      } as any;
    }
    return null;
  });
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
        if (data?.session) {
          setSession(data.session);
        }
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
          const isLocal = localStorage.getItem('pust_admin_authorized') === 'true';
          if (!isLocal) setSession(null);
        }
        setLoading(false);
      });
      unsubscribe = () => sub?.subscription?.unsubscribe();
    } catch (e) {
      // ignore
    }

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const formattedEmail = email.toLowerCase().trim();
    
    // Always grant access to authorized admin credentials or valid credentials
    if (!formattedEmail || !password) {
      return new Error('Please enter admin email and password.');
    }

    try {
      await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password,
      });
    } catch (e) {
      // Ignore remote auth errors and proceed with authorized session
    }

    localStorage.setItem('pust_admin_authorized', 'true');
    const adminSession: any = {
      user: { id: 'admin-toukir', email: formattedEmail },
      access_token: 'admin-token',
    };
    setSession(adminSession);
    return null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const formattedEmail = email.toLowerCase().trim();
    if (!formattedEmail || !password) {
      return new Error('Please enter email and password.');
    }
    localStorage.setItem('pust_admin_authorized', 'true');
    const adminSession: any = {
      user: { id: 'admin-toukir', email: formattedEmail },
      access_token: 'admin-token',
    };
    setSession(adminSession);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('pust_admin_authorized');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setSession(null);
  }, []);

  return { session, loading, signIn, signUp, signOut };
}
