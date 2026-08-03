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
        scrolled
          ? 'bg-white/85 shadow-sm backdrop-blur-md'
          : 'bg-white/0'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-ink-900">Project Portal</span>
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

        <div className="flex items-center gap-2">
          <button
            onClick={onAdminClick}
            className="hidden items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 sm:flex"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-200 bg-white px-4 py-3 md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              onAdminClick();
            }}
            className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </button>
        </div>
      )}
    </header>
  );
}
