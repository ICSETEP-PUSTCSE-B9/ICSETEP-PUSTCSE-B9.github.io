import { useState } from 'react';
import { Lock, Mail, X, ShieldCheck, Loader2, LogIn } from 'lucide-react';

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ message: string } | null>;
  onClose: () => void;
}

export default function AdminLogin({ onSignIn, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const err = await onSignIn(email, password);
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">
                Admin Portal Access
              </h2>
              <p className="text-xs text-ink-500">Authorized Project Lead Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Admin Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abc@gmil.com"
                className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                required
                minLength={4}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="passwod@"
                className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 shadow-sm"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {busy ? 'Verifying Credentials…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-400">
          Strictly for authorized project leaders and administrators.
        </p>
      </div>
    </div>
  );
}
