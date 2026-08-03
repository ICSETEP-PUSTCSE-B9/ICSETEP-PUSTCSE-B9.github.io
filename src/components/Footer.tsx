import { ShieldCheck } from 'lucide-react';
import type { ProjectInfo } from '@/lib/types';

interface Props {
  info: ProjectInfo | null;
}

export default function Footer({ info }: Props) {
  return (
    <footer className="border-t border-ink-200 bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold text-white">Portal</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-ink-400">
              {info ? info.title : 'Official project portal'} — info, updates, and notices in one place.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="#overview" className="text-ink-400 transition-colors hover:text-white">Overview</a>
            <a href="#notices" className="text-ink-400 transition-colors hover:text-white">Notices</a>
            <a href="#updates" className="text-ink-400 transition-colors hover:text-white">Updates</a>
          </nav>
        </div>
        <div className="mt-10 border-t border-ink-800 pt-6 text-xs text-ink-500">
          © {new Date().getFullYear()} {info ? info.title : 'Project Portal'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
