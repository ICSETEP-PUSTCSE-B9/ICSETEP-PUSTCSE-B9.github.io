import { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X } from 'lucide-react';

interface Props {
  onAdminClick: () => void;
}

export default function Header({ onAdminClick }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Mission & Vision', href: '#mission-vision' },
    { label: 'PI & Co-PI', href: '#pi-team' },
    { label: 'Technologies', href: '#technologies' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Publications', href: '#publications' },
    { label: 'Notices', href: '#notices' },
    { label: 'Updates', href: '#updates' },
  ];

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white/95 shadow-sm backdrop-blur-md'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shrink-0">
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="font-display text-base sm:text-lg font-bold text-ink-900 truncate">Project Portal</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100 hover:border-brand-300 shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-600 shrink-0" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-200 bg-white/95 backdrop-blur-md px-4 py-3 md:hidden shadow-lg animate-fade-in">
          <div className="space-y-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-brand-700 active:bg-ink-100"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                onAdminClick();
              }}
              className="mt-2 flex w-full items-center gap-2 rounded-lg bg-brand-50 border border-brand-200 px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
