import { Component, ReactNode, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useProjectInfo, useNotices, useUpdates, usePublications, usePhases, useAuth } from '@/lib/hooks';
import { useScrollReveal } from '@/lib/useScrollReveal';
import NoticeTicker from '@/components/NoticeTicker';
import Header from '@/components/Header';
import ProjectOverview from '@/components/ProjectOverview';
import NoticeBoard from '@/components/NoticeBoard';
import UpdatesTimeline from '@/components/UpdatesTimeline';
import Footer from '@/components/Footer';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import PITeam from '@/components/PITeam';
import MissionVision from '@/components/MissionVision';

import CoreTechnologies from '@/components/CoreTechnologies';
import ProjectRoadmap from '@/components/ProjectRoadmap';
import Publications from '@/components/Publications';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Admin Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="font-display text-lg font-bold text-ink-900 mb-2">Admin Panel Recovery</h3>
            <p className="text-sm text-ink-600 mb-4">
              {this.state.error?.message || 'An error occurred while displaying the admin dashboard.'}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('pust_admin_authorized');
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Reset Session & Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { data: info, refresh: refreshInfo } = useProjectInfo();
  const { data: notices, refresh: refreshNotices } = useNotices();
  const { data: updates, refresh: refreshUpdates } = useUpdates();
  const { refresh: refreshPublications } = usePublications();
  const { refresh: refreshPhases } = usePhases();
  const { session, loading: authLoading, signIn, signOut } = useAuth();

  const [adminOpen, setAdminOpen] = useState(false);

  const refreshAll = useCallback(() => {
    refreshInfo();
    refreshNotices();
    refreshUpdates();
    refreshPublications();
    refreshPhases();
  }, [refreshInfo, refreshNotices, refreshUpdates, refreshPublications, refreshPhases]);

  useScrollReveal();

  const handleAdminClick = () => setAdminOpen(true);
  const handleSignOut = async () => {
    await signOut();
  };

  const showLogin = adminOpen && !session;
  const showDashboard = adminOpen && Boolean(session);

  return (
    <div id="top" className="min-h-screen bg-white text-ink-900">
      <NoticeTicker notices={notices} />
      <Header onAdminClick={handleAdminClick} />

      <main>
        <ProjectOverview info={info} />
        <MissionVision />
        <PITeam />
        <CoreTechnologies />
        <ProjectRoadmap />
        <Publications />
        <NoticeBoard notices={notices} />
        <UpdatesTimeline updates={updates} />
      </main>

      <Footer info={info} />

      <AdminErrorBoundary>
        {showLogin && (
          <AdminLogin
            onSignIn={signIn}
            onClose={() => setAdminOpen(false)}
          />
        )}
        {showDashboard && (
          <AdminDashboard
            onSignOut={handleSignOut}
            onClose={() => setAdminOpen(false)}
            onChanged={refreshAll}
          />
        )}
      </AdminErrorBoundary>
    </div>
  );
}
