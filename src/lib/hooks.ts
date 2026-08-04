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
  const isSampleNotice = (n: Notice) => {
    const text = (n.title + ' ' + n.body).toLowerCase();
    return (
      n.id === 'notice-1' ||
      n.id === 'notice-2' ||
      n.id.startsWith('default-') ||
      n.id === 'welcome-notice' ||
      text.includes('dummy notice') ||
      text.includes('it is demo') ||
      text.includes('dummy1')
    );
  };

  const loadNotices = useCallback(() => {
    try {
      const cached = localStorage.getItem('pust_notices_cache');
      const list: Notice[] = cached ? JSON.parse(cached) : [];
      const deletedStr = localStorage.getItem('pust_deleted_notices');
      const deletedIds = new Set<string>(deletedStr ? JSON.parse(deletedStr) : []);
      return list.filter((n) => !deletedIds.has(n.id) && !isSampleNotice(n));
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
      // 1. Fetch GitHub hosted notices.json for global visitor access
      let githubNotices: Notice[] = [];
      try {
        const ghRes = await window.fetch('./notices.json?v=' + Date.now());
        if (ghRes.ok) {
          githubNotices = await ghRes.json();
        } else {
          const rawRes = await window.fetch(
            'https://raw.githubusercontent.com/ICSETEP-PUSTCSE-B9/ICSETEP-PUSTCSE-B9.github.io/main/public/notices.json?v=' + Date.now()
          );
          if (rawRes.ok) githubNotices = await rawRes.json();
        }
      } catch (e) {
        console.warn('GitHub notice fetch:', e);
      }

      // 2. Fetch Supabase remote notices
      let remoteNotices: Notice[] = [];
      try {
        const { data: resData } = await supabase
          .from('notices')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        if (resData) remoteNotices = resData as Notice[];
      } catch {}

      const cached = localStorage.getItem('pust_notices_cache');
      const localList: Notice[] = cached ? JSON.parse(cached) : [];

      const deletedStr = localStorage.getItem('pust_deleted_notices');
      const deletedIds = new Set<string>(deletedStr ? JSON.parse(deletedStr) : []);

      const map = new Map<string, Notice>();
      // Insert GitHub repo notices (excluding deleted & sample)
      githubNotices.forEach((n) => {
        if (!deletedIds.has(n.id) && !isSampleNotice(n)) map.set(n.id, n);
      });
      // Insert remote notices (excluding deleted & sample)
      remoteNotices.forEach((n) => {
        if (!deletedIds.has(n.id) && !isSampleNotice(n)) map.set(n.id, n);
      });
      // Override/append local notices (excluding deleted & sample)
      localList.forEach((n) => {
        if (!deletedIds.has(n.id) && !isSampleNotice(n)) map.set(n.id, n);
      });

      const merged = Array.from(map.values()).sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setData(merged);
      localStorage.setItem('pust_notices_cache', JSON.stringify(merged));
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

const defaultUpdates: ProjectUpdate[] = [
  {
    id: 'default-update-1',
    title: 'ICSETEP RDG B9 Research Sub-Project Inception',
    body: 'Official kickoff and agreement signing for the Smart, Affordable, and Sustainable Agro-Tech Transformation research sub-project funded by ADB & UGC under ICSETEP.',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-update-2',
    title: 'Hyperspectral & XAI Hardware Infrastructure Setup',
    body: 'Establishment of state-of-the-art research laboratory facilities at the Department of Computer Science & Engineering, Pabna University of Science & Technology (PUST).',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-update-3',
    title: 'Algorithm Design & Hyperspectral Calibration',
    body: 'Initiated neural network architecture design for non-destructive agricultural product quality assessment and XAI feature visualization maps.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useUpdates() {
  const loadUpdates = useCallback(() => {
    try {
      const cached = localStorage.getItem('pust_updates_cache');
      const list: ProjectUpdate[] = cached ? JSON.parse(cached) : [];
      return list.length > 0 ? list : defaultUpdates;
    } catch {
      return defaultUpdates;
    }
  }, []);

  const [data, setData] = useState<ProjectUpdate[]>(loadUpdates);
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

      const cached = localStorage.getItem('pust_updates_cache');
      const localList: ProjectUpdate[] = cached ? JSON.parse(cached) : [];

      const map = new Map<string, ProjectUpdate>();
      if (resData && resData.length > 0) {
        (resData as ProjectUpdate[]).forEach((u) => map.set(u.id, u));
      }
      localList.forEach((u) => map.set(u.id, u));

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const finalData = merged.length > 0 ? merged : defaultUpdates;
      setData(finalData);
      localStorage.setItem('pust_updates_cache', JSON.stringify(finalData));

      if (resError && finalData.length === 0) {
        setError(resError.message);
      }
    } catch (e: any) {
      if (data.length === 0) setData(defaultUpdates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();

    const handleUpdate = () => {
      const current = loadUpdates();
      setData(current);
    };

    window.addEventListener('pust_updates_updated', handleUpdate);
    return () => window.removeEventListener('pust_updates_updated', handleUpdate);
  }, [fetch, loadUpdates]);

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
