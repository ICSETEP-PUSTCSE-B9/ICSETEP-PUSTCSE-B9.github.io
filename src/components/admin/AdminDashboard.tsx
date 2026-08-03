import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNotices, useUpdates } from '@/lib/hooks';
import type { Notice, ProjectUpdate, NoticeInput, UpdateInput, Priority } from '@/lib/types';
import { priorityStyles, formatDate } from '@/lib/utils';
import { X, Megaphone, History, Plus, Pencil, Trash2, Pin, PinOff, Loader2, Save } from 'lucide-react';

interface Props {
  onSignOut: () => void;
  onClose: () => void;
  onChanged: () => void;
}

type Tab = 'notices' | 'updates';

export default function AdminDashboard({ onSignOut, onClose, onChanged }: Props) {
  const [tab, setTab] = useState<Tab>('notices');
  const { data: notices, refresh: refreshNotices } = useNotices();
  const { data: updates, refresh: refreshUpdates } = useUpdates();

  const tabs: { key: Tab; label: string; icon: typeof Megaphone }[] = [
    { key: 'notices', label: 'Notices', icon: Megaphone },
    { key: 'updates', label: 'Updates', icon: History },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-ink-950/60 backdrop-blur-sm animate-fade-in">
      {/* drawer panel */}
      <div className="ml-auto flex h-full w-full max-w-2xl flex-col bg-ink-50 shadow-2xl animate-fade-in">
        {/* header */}
        <div className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Megaphone className="h-4 w-4" />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSignOut}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Sign Out
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-ink-200 bg-white px-4 sm:px-6">
          {tabs.map((t) => {
            const Icon = t.icon;
            const activeTab = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto scroll-thin p-4 sm:p-6">
          {tab === 'notices' && (
            <NoticesAdmin
              notices={notices}
              refresh={refreshNotices}
              onChanged={onChanged}
            />
          )}
          {tab === 'updates' && (
            <UpdatesAdmin updates={updates} refresh={refreshUpdates} onChanged={onChanged} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Notices Admin ---------------- */

function NoticesAdmin({
  notices,
  refresh,
  onChanged,
}: {
  notices: Notice[];
  refresh: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Notice | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const togglePin = async (n: Notice) => {
    setBusyId(n.id);
    const { error } = await supabase.from('notices').update({ is_pinned: !n.is_pinned }).eq('id', n.id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    refresh(); onChanged();
  };

  const toggleActive = async (n: Notice) => {
    setBusyId(n.id);
    const { error } = await supabase.from('notices').update({ is_active: !n.is_active }).eq('id', n.id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    refresh(); onChanged();
  };

  const remove = async (n: Notice) => {
    if (!confirm(`Delete notice "${n.title}"? This cannot be undone.`)) return;
    setBusyId(n.id);
    const { error } = await supabase.from('notices').delete().eq('id', n.id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    refresh(); onChanged();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">{notices.length} notices total</p>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> New Notice
        </button>
      </div>

      <div className="space-y-3">
        {notices.map((n) => {
          const ps = priorityStyles[n.priority];
          return (
            <div
              key={n.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition-opacity ${
                n.is_active ? 'border-ink-200' : 'border-ink-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${ps.badge}`}>
                      {ps.label}
                    </span>
                    {n.is_pinned && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    {!n.is_active && (
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-500">
                        Hidden
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-ink-900">{n.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{n.body}</p>
                  <p className="mt-2 text-xs text-ink-400">{formatDate(n.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => setEditing(n)}
                    className="rounded-lg border border-ink-200 p-1.5 text-ink-600 hover:bg-ink-50"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => togglePin(n)}
                    disabled={busyId === n.id}
                    className="rounded-lg border border-ink-200 p-1.5 text-amber-600 hover:bg-amber-50"
                    title={n.is_pinned ? 'Unpin' : 'Pin to ticker'}
                  >
                    {busyId === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : n.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => toggleActive(n)}
                    disabled={busyId === n.id}
                    className={`rounded-lg border p-1.5 ${n.is_active ? 'border-ink-200 text-ink-600 hover:bg-ink-50' : 'border-brand-200 text-brand-600 hover:bg-brand-50'}`}
                    title={n.is_active ? 'Hide' : 'Show'}
                  >
                    {n.is_active ? 'On' : 'Off'}
                  </button>
                  <button
                    onClick={() => remove(n)}
                    disabled={busyId === n.id}
                    className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(creating || editing) && (
        <NoticeForm
          notice={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); onChanged(); }}
        />
      )}
    </div>
  );
}

function NoticeForm({
  notice,
  onClose,
  onSaved,
}: {
  notice: Notice | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(notice?.title ?? '');
  const [body, setBody] = useState(notice?.body ?? '');
  const [priority, setPriority] = useState<Priority>(notice?.priority ?? 'normal');
  const [isPinned, setIsPinned] = useState(notice?.is_pinned ?? false);
  const [isActive, setIsActive] = useState(notice?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const input: NoticeInput = { title, body, priority, is_pinned: isPinned, is_active: isActive };
    const op = notice
      ? supabase.from('notices').update(input).eq('id', notice.id)
      : supabase.from('notices').insert(input);
    const { error } = await op;
    setSaving(false);
    if (error) { setError(error.message); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/50 p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">
            {notice ? 'Edit Notice' : 'New Notice'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Body">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className={inputCls} />
          </Field>
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputCls}>
              <option value="low">Info</option>
              <option value="normal">Notice</option>
              <option value="high">High Priority</option>
            </select>
          </Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              Pin to sliding ticker
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              Visible
            </label>
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Updates Admin ---------------- */

function UpdatesAdmin({
  updates,
  refresh,
  onChanged,
}: {
  updates: ProjectUpdate[];
  refresh: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<ProjectUpdate | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (u: ProjectUpdate) => {
    if (!confirm(`Delete update "${u.title}"?`)) return;
    setBusyId(u.id);
    const { error } = await supabase.from('updates').delete().eq('id', u.id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    refresh(); onChanged();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">{updates.length} updates</p>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> New Update
        </button>
      </div>

      <div className="space-y-3">
        {updates.map((u) => (
          <div key={u.id} className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{formatDate(u.created_at)}</p>
                <h3 className="mt-1 font-semibold text-ink-900">{u.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">{u.body}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => setEditing(u)} className="rounded-lg border border-ink-200 p-1.5 text-ink-600 hover:bg-ink-50">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(u)} disabled={busyId === u.id} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50">
                  {busyId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <UpdateForm
          update={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); onChanged(); }}
        />
      )}
    </div>
  );
}

function UpdateForm({
  update,
  onClose,
  onSaved,
}: {
  update: ProjectUpdate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(update?.title ?? '');
  const [body, setBody] = useState(update?.body ?? '');
  const [date, setDate] = useState(update ? update.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const input: UpdateInput = { title, body };
    const op = update
      ? supabase.from('updates').update({ ...input, created_at: new Date(date).toISOString() }).eq('id', update.id)
      : supabase.from('updates').insert({ ...input, created_at: new Date(date).toISOString() });
    const { error } = await op;
    setSaving(false);
    if (error) { setError(error.message); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/50 p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">{update ? 'Edit Update' : 'New Update'}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Body">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className={inputCls} />
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

const inputCls =
  'w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
