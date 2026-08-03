import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useProjectInfo, useNotices, useUpdates, useAuth } from '@/lib/hooks';
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

export default function App() {
  const { data: info, refresh: refreshInfo } = useProjectInfo();
  const { data: notices, refresh: refreshNotices } = useNotices();
  const { data: updates, refresh: refreshUpdates } = useUpdates();
  const { session, loading: authLoading, signIn, signUp, signOut } = useAuth();

  const [adminOpen, setAdminOpen] = useState(false);

  const refreshAll = useCallback(() => {
    refreshInfo();
    refreshNotices();
    refreshUpdates();
  }, [refreshInfo, refreshNotices, refreshUpdates]);

  useScrollReveal();

  const handleAdminClick = () => setAdminOpen(true);
  const handleSignOut = async () => {
    await signOut();
  };

  const showLogin = adminOpen && !session && !authLoading;
  const showDashboard = adminOpen && session;

  return (
    <div id="top" className="min-h-screen bg-white text-ink-900">
      <NoticeTicker notices={notices} />
      <Header onAdminClick={handleAdminClick} />

      <main>
        <ProjectOverview info={info} />
        <PITeam />
        <MissionVision />
        <CoreTechnologies />
        <ProjectRoadmap />
        <Publications />
        <NoticeBoard notices={notices} />
        <UpdatesTimeline updates={updates} />
      </main>

      <Footer info={info} />

      {showLogin && (
        <AdminLogin
          onSignIn={signIn}
          onSignUp={signUp}
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
    </div>
  );
}
