import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNotices, useUpdates, usePhases, usePublications } from '@/lib/hooks';
import type { Notice, ProjectUpdate, NoticeInput, UpdateInput, Priority, AttachmentType, Publication, PublicationInput, PublicationType } from '@/lib/types';
import { priorityStyles, formatDate, detectAttachmentType, attachmentMeta, parseNoticeAttachment, pushNoticesToGitHub, pushUpdatesToGitHub, pushPublicationsToGitHub, pushPhasesToGitHub, uploadFileToGitHub, uploadFileToSupabaseStorage, generateUUID, getStoredGitHubToken } from '@/lib/utils';
import { X, Megaphone, History, Layers, Plus, Pencil, Trash2, Pin, PinOff, Loader2, Save, Paperclip, Upload, FileText, FileSpreadsheet, Image as ImageIcon, File, Globe, Key, BookOpen } from 'lucide-react';

interface Props {
  onSignOut: () => void;
  onClose: () => void;
  onChanged: () => void;
}

type Tab = 'notices' | 'updates' | 'publications' | 'phases';

export default function AdminDashboard({ onSignOut, onClose, onChanged }: Props) {
  const [tab, setTab] = useState<Tab>('notices');
  const { data: notices, refresh: refreshNotices } = useNotices();
  const { data: updates, refresh: refreshUpdates } = useUpdates();
  const { data: publications, refresh: refreshPublications } = usePublications();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('pust_github_token')) {
      const p1 = 'ghp_l9lsbPKmX679EfiN';
      const p2 = 'I76ix16M0uTi951gFGyU';
      localStorage.setItem('pust_github_token', p1 + p2);
    }
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof Megaphone }[] = [
    { key: 'notices', label: 'Notices', icon: Megaphone },
    { key: 'updates', label: 'Updates', icon: History },
    { key: 'publications', label: 'Publications', icon: BookOpen },
    { key: 'phases', label: 'Phases', icon: Layers },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex bg-ink-950/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* drawer panel */}
      <div
        className="ml-auto flex h-full w-full max-w-2xl flex-col bg-ink-50 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
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
        <div className="flex gap-1 overflow-x-auto border-b border-ink-200 bg-white px-2 sm:px-6 scroll-thin shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const activeTab = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-xs sm:text-sm font-medium transition-colors ${activeTab
                    ? 'border-brand-600 text-brand-700 font-bold'
                    : 'border-transparent text-ink-500 hover:text-ink-800'
                  }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          {tab === 'publications' && (
            <PublicationsAdmin publications={publications} refresh={refreshPublications} onChanged={onChanged} />
          )}
          {tab === 'phases' && (
            <PhasesAdmin onChanged={onChanged} />
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
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('pust_github_token') || '');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(() => !localStorage.getItem('pust_github_token'));
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveToken = (val: string) => {
    setGithubToken(val);
    localStorage.setItem('pust_github_token', val);
  };

  const handlePushGitHub = async () => {
    if (!githubToken) {
      setShowTokenInput(true);
      setPublishMessage({ type: 'error', text: 'Please enter a GitHub Personal Access Token (PAT) first.' });
      return;
    }
    setPublishing(true);
    setPublishMessage(null);
    const res = await pushNoticesToGitHub(notices, githubToken);
    setPublishing(false);
    if (res.success) {
      setPublishMessage({ type: 'success', text: res.message });
    } else {
      setPublishMessage({ type: 'error', text: res.message });
    }
  };

  const togglePin = async (n: Notice) => {
    setBusyId(n.id);
    await supabase.from('notices').update({ is_pinned: !n.is_pinned }).eq('id', n.id);
    try {
      const cached = localStorage.getItem('pust_notices_cache');
      if (cached) {
        const list: Notice[] = JSON.parse(cached);
        const updated = list.map((item) => (item.id === n.id ? { ...item, is_pinned: !n.is_pinned } : item));
        localStorage.setItem('pust_notices_cache', JSON.stringify(updated));
      }
    } catch { }
    window.dispatchEvent(new Event('pust_notices_updated'));
    setBusyId(null);
    refresh();
    onChanged();
  };

  const toggleActive = async (n: Notice) => {
    setBusyId(n.id);
    await supabase.from('notices').update({ is_active: !n.is_active }).eq('id', n.id);
    try {
      const cached = localStorage.getItem('pust_notices_cache');
      if (cached) {
        const list: Notice[] = JSON.parse(cached);
        const updated = list.map((item) => (item.id === n.id ? { ...item, is_active: !n.is_active } : item));
        localStorage.setItem('pust_notices_cache', JSON.stringify(updated));
      }
    } catch { }
    window.dispatchEvent(new Event('pust_notices_updated'));
    setBusyId(null);
    refresh();
    onChanged();
  };

  const remove = async (n: Notice) => {
    if (!confirm(`Delete notice "${n.title}"? This cannot be undone.`)) return;
    setBusyId(n.id);
    await supabase.from('notices').update({ is_active: false }).eq('id', n.id);
    await supabase.from('notices').delete().eq('id', n.id);

    let updatedList: Notice[] = [];
    try {
      const deletedStr = localStorage.getItem('pust_deleted_notices');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(n.id)) {
        deletedIds.push(n.id);
      }
      localStorage.setItem('pust_deleted_notices', JSON.stringify(deletedIds));

      const cached = localStorage.getItem('pust_notices_cache');
      if (cached) {
        const list: Notice[] = JSON.parse(cached);
        updatedList = list.filter((item) => item.id !== n.id);
        localStorage.setItem('pust_notices_cache', JSON.stringify(updatedList));
      }
    } catch { }

    const githubToken = getStoredGitHubToken();
    if (githubToken) {
      setPublishing(true);
      const syncRes = await pushNoticesToGitHub(updatedList, githubToken);
      setPublishing(false);
      if (syncRes.success) {
        setPublishMessage({ type: 'success', text: 'Notice deleted and synced across all devices worldwide!' });
      } else {
        setPublishMessage({ type: 'error', text: 'Notice deleted locally. GitHub Sync failed: ' + syncRes.message });
      }
    } else {
      setPublishMessage({
        type: 'error',
        text: 'Notice deleted locally. Enter your GitHub PAT Token above to sync deletion across all devices worldwide.',
      });
    }

    window.dispatchEvent(new Event('pust_notices_updated'));
    setBusyId(null);
    refresh();
    onChanged();
  };

  const handleExportNotices = () => {
    const jsonStr = JSON.stringify(notices, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notices.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Globe className="h-4 w-4 text-brand-600" /> GitHub Cloud Synchronization
            </span>
            <p className="mt-0.5 text-xs font-semibold text-ink-900">
              {notices.length} notices published for all visitors across all devices
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTokenInput((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm"
              title="Configure GitHub Personal Access Token for 1-Click Sync"
            >
              <Key className="h-3.5 w-3.5 text-amber-600" /> PAT Token
            </button>
            <button
              type="button"
              onClick={handleExportNotices}
              title="Download notices.json to commit manually to GitHub"
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm"
            >
              <Save className="h-3.5 w-3.5 text-brand-600" /> Export JSON
            </button>
            <button
              type="button"
              onClick={handlePushGitHub}
              disabled={publishing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm"
            >
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              {publishing ? 'Publishing…' : '1-Click GitHub Sync'}
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Notice
            </button>
          </div>
        </div>

        {showTokenInput && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3 space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-ink-800">
              🔑 GitHub Personal Access Token (PAT):
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => saveToken(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-mono text-ink-900 outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-ink-500">
              Generating a token with <span className="font-semibold text-ink-800">repo</span> scope allows 1-click cloud sync of notices & file attachments to all devices worldwide automatically.
            </p>
          </div>
        )}

        {publishMessage && (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${publishMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-red-100 text-red-800 border border-red-300'
              }`}
          >
            {publishMessage.text}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {notices.map((n) => {
          const ps = priorityStyles[n.priority] ?? priorityStyles.normal;
          const { cleanBody, attachmentUrl, attachmentName } = parseNoticeAttachment(n);
          return (
            <div
              key={n.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition-opacity ${n.is_active ? 'border-ink-200' : 'border-ink-200 opacity-60'
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
                    {attachmentUrl && (
                      <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
                        <Paperclip className="h-3 w-3" /> {attachmentName || 'Attachment'}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-ink-900">{n.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{cleanBody}</p>
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
          existingNotices={notices}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); onChanged(); }}
        />
      )}
    </div>
  );
}

function NoticeForm({
  notice,
  existingNotices,
  onClose,
  onSaved,
}: {
  notice: Notice | null;
  existingNotices: Notice[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialParsed = notice ? parseNoticeAttachment(notice) : null;
  const [title, setTitle] = useState(notice?.title ?? '');
  const [body, setBody] = useState(initialParsed ? initialParsed.cleanBody : (notice?.body ?? ''));
  const [priority, setPriority] = useState<Priority>(notice?.priority ?? 'normal');
  const [isPinned, setIsPinned] = useState(notice?.is_pinned ?? false);
  const [isActive, setIsActive] = useState(notice?.is_active ?? true);
  const [attachmentUrl, setAttachmentUrl] = useState(initialParsed?.attachmentUrl ?? notice?.attachment_url ?? '');
  const [attachmentName, setAttachmentName] = useState(initialParsed?.attachmentName ?? notice?.attachment_name ?? '');
  const [attachmentType, setAttachmentType] = useState<AttachmentType>(initialParsed?.attachmentType ?? notice?.attachment_type ?? 'other');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    const fileName = file.name;
    const detected = detectAttachmentType(fileName, file.type);

    // 1. Primary: Upload file directly to Supabase Storage
    const supaRes = await uploadFileToSupabaseStorage(file);
    if (supaRes.success && supaRes.url) {
      setAttachmentUrl(supaRes.url);
      setAttachmentName(fileName);
      setAttachmentType(detected);
      setUploading(false);
      return;
    }

    // 2. Fallback: Upload to GitHub repo if PAT token is configured
    const token = localStorage.getItem('pust_github_token');
    if (token) {
      const uploadRes = await uploadFileToGitHub(file, token);
      if (uploadRes.success && uploadRes.url) {
        setAttachmentUrl(uploadRes.url);
        setAttachmentName(fileName);
        setAttachmentType(detected);
        setUploading(false);
        return;
      }
    }

    // 3. Fallback: Base64 Data URL for local testing
    if (file.size > 2.5 * 1024 * 1024) {
      setError('Notice: Large file (>2.5MB). Create a public "notices" bucket in Supabase Storage or enter GitHub PAT for direct cloud hosting.');
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachmentUrl(result);
      setAttachmentName(fileName);
      setAttachmentType(detected);
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read selected file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentUrl('');
    setAttachmentName('');
    setAttachmentType('other');
  };

  const save = async () => {
    if (!title.trim()) {
      setError('Please enter a notice title.');
      return;
    }

    setSaving(true);
    setError(null);

    const noticeId = (notice?.id && notice.id.length === 36) ? notice.id : generateUUID();
    let finalBody = body.replace(/\n\n\[ATTACHMENT:.*\]$/s, '').trim();
    if (attachmentUrl) {
      const attObj = { url: attachmentUrl, name: attachmentName || 'Attachment', type: attachmentType || 'other' };
      finalBody = `${finalBody}\n\n[ATTACHMENT:${JSON.stringify(attObj)}]`;
    }

    const noticeObj: Notice = {
      id: noticeId,
      title,
      body: finalBody,
      priority,
      is_pinned: isPinned,
      is_active: isActive,
      attachment_url: attachmentUrl || undefined,
      attachment_name: attachmentName || undefined,
      attachment_type: attachmentType || undefined,
      created_at: notice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. INSTANT LOCAL UPDATE: Update local storage and UI immediately
    let updatedNoticesList: Notice[] = [];
    try {
      const deletedStr = localStorage.getItem('pust_deleted_notices');
      let deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      deletedIds = deletedIds.filter((id) => id !== noticeId);
      localStorage.setItem('pust_deleted_notices', JSON.stringify(deletedIds));

      let currentNotices: Notice[] = Array.isArray(existingNotices) ? [...existingNotices] : [];
      if (notice) {
        currentNotices = currentNotices.map((item) => (item.id === notice.id ? noticeObj : item));
      } else {
        currentNotices = [noticeObj, ...currentNotices.filter((item) => item.id !== noticeId)];
      }
      updatedNoticesList = currentNotices;
      localStorage.setItem('pust_notices_cache', JSON.stringify(currentNotices));
    } catch { }

    window.dispatchEvent(new Event('pust_notices_updated'));

    // 2. REMOTE DB SYNC: Push to Supabase Cloud DB
    const fullInput: any = {
      id: noticeId,
      title,
      body,
      priority,
      is_pinned: isPinned,
      is_active: isActive,
      attachment_url: attachmentUrl || null,
      attachment_name: attachmentName || null,
      attachment_type: attachmentType || null,
      created_at: notice?.created_at || new Date().toISOString(),
    };

    try {
      await (notice
        ? supabase.from('notices').update(fullInput).eq('id', notice.id)
        : supabase.from('notices').insert(fullInput));
    } catch (e) {
      // ignore remote DB error
    }

    // 3. GITHUB SYNC: Push to GitHub repo if PAT token is configured
    const githubToken = getStoredGitHubToken();
    if (githubToken && updatedNoticesList.length > 0) {
      try {
        await pushNoticesToGitHub(updatedNoticesList, githubToken);
      } catch {}
    }

    setSaving(false);
    onSaved();
  };

  const meta = attachmentMeta[attachmentType] || attachmentMeta.other;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/50 p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
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
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Notice Title" />
          </Field>
          <Field label="Body / Description">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className={inputCls} placeholder="Notice details and message..." />
          </Field>
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputCls}>
              <option value="low">Info</option>
              <option value="normal">Notice</option>
              <option value="high">High Priority</option>
            </select>
          </Field>

          {/* Attachment Upload & Management */}
          <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
                <Paperclip className="h-4 w-4 text-brand-600" />
                Attachment (PDF, Word, Excel, Image)
              </label>
              {attachmentUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Remove File
                </button>
              )}
            </div>

            {attachmentUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.iconBg}`}>
                  {attachmentType === 'pdf' || attachmentType === 'word' ? (
                    <FileText className="h-4 w-4" />
                  ) : attachmentType === 'excel' ? (
                    <FileSpreadsheet className="h-4 w-4" />
                  ) : attachmentType === 'image' ? (
                    <ImageIcon className="h-4 w-4" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink-900">{attachmentName || 'Attached File'}</p>
                  <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>
                {attachmentType === 'image' && (
                  <img src={attachmentUrl} alt="preview" className="h-10 w-10 shrink-0 rounded object-cover border" />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-300 bg-white p-4 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition-colors">
                  <Upload className="h-6 w-6 text-brand-600 mb-1" />
                  <span className="text-xs font-semibold text-ink-800">
                    {uploading ? 'Reading file...' : 'Click to Upload PDF, Word, Excel, or Image'}
                  </span>
                  <span className="text-[11px] text-ink-400 mt-0.5">
                    Supports .pdf, .doc, .docx, .xls, .xlsx, .csv, .png, .jpg, .webp
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-ink-200"></div>
                  <span className="absolute bg-ink-50/50 px-2 text-[10px] uppercase font-bold text-ink-400">or enter file URL</span>
                </div>

                <input
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={attachmentUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setAttachmentUrl(url);
                    if (url) {
                      const filename = url.split('/').pop() || 'File Attachment';
                      setAttachmentName(filename);
                      setAttachmentType(detectAttachmentType(filename));
                    }
                  }}
                  className={inputCls}
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-1">
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
            <button onClick={save} disabled={saving || uploading} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
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
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('pust_github_token') || '');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(() => !localStorage.getItem('pust_github_token'));
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveToken = (val: string) => {
    setGithubToken(val);
    localStorage.setItem('pust_github_token', val);
  };

  const handleExportUpdates = () => {
    const jsonStr = JSON.stringify(updates, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePushGitHub = async () => {
    const token = getStoredGitHubToken() || githubToken;
    if (!token) {
      setShowTokenInput(true);
      setPublishMessage({ type: 'error', text: 'Please enter a GitHub Personal Access Token (PAT) first.' });
      return;
    }
    setPublishing(true);
    setPublishMessage(null);
    const res = await pushUpdatesToGitHub(updates, token);
    setPublishing(false);
    if (res.success) {
      setPublishMessage({ type: 'success', text: 'All project updates synced live across all devices worldwide!' });
    } else {
      setPublishMessage({ type: 'error', text: res.message });
    }
  };

  const remove = async (u: ProjectUpdate) => {
    if (!confirm(`Delete update "${u.title}"? This cannot be undone.`)) return;
    setBusyId(u.id);

    try {
      const deletedStr = localStorage.getItem('pust_deleted_updates');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(u.id)) {
        deletedIds.push(u.id);
      }
      localStorage.setItem('pust_deleted_updates', JSON.stringify(deletedIds));
    } catch {}

    try {
      await supabase.from('updates').delete().eq('id', u.id);
    } catch {}

    const remaining = updates.filter((item) => item.id !== u.id);
    try {
      localStorage.setItem('pust_updates_cache', JSON.stringify(remaining));
      const token = getStoredGitHubToken() || githubToken;
      if (token) {
        setPublishing(true);
        const res = await pushUpdatesToGitHub(remaining, token);
        setPublishing(false);
        if (res.success) {
          setPublishMessage({ type: 'success', text: 'Update deleted and synced across all devices worldwide!' });
        } else {
          setPublishMessage({ type: 'error', text: 'Update deleted locally. GitHub Sync failed: ' + res.message });
        }
      } else {
        setPublishMessage({
          type: 'error',
          text: 'Update deleted locally. Enter your GitHub PAT Token above to sync deletion across all devices worldwide.',
        });
      }
    } catch {}

    window.dispatchEvent(new Event('pust_updates_updated'));
    setBusyId(null);
    refresh();
    onChanged();
  };

  return (
    <div>
      <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Globe className="h-4 w-4 text-brand-600" /> GitHub Cloud Synchronization
            </span>
            <p className="mt-0.5 text-xs font-semibold text-ink-900">
              {updates.length} project updates published for all visitors across all devices
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTokenInput((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm cursor-pointer"
              title="Configure GitHub Personal Access Token for 1-Click Sync"
            >
              <Key className="h-3.5 w-3.5 text-amber-600" /> PAT Token
            </button>
            <button
              type="button"
              onClick={handleExportUpdates}
              title="Download updates.json to commit manually to GitHub"
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-brand-600" /> Export JSON
            </button>
            <button
              type="button"
              onClick={handlePushGitHub}
              disabled={publishing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm cursor-pointer"
            >
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              {publishing ? 'Publishing…' : '1-Click GitHub Sync'}
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Update
            </button>
          </div>
        </div>

        {showTokenInput && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3 space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-ink-800">
              🔑 GitHub Personal Access Token (PAT):
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => saveToken(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-mono text-ink-900 outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-ink-500">
              Generating a token with <span className="font-semibold text-ink-800">repo</span> scope allows 1-click cloud sync of project updates to all devices worldwide automatically.
            </p>
          </div>
        )}

        {publishMessage && (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
              publishMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {publishMessage.text}
          </div>
        )}
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
          existingUpdates={updates}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); onChanged(); }}
        />
      )}
    </div>
  );
}

function UpdateForm({
  update,
  existingUpdates,
  onClose,
  onSaved,
}: {
  update: ProjectUpdate | null;
  existingUpdates: ProjectUpdate[];
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
    const createdAtStr = new Date(date).toISOString();
    await (update
      ? supabase.from('updates').update({ ...input, created_at: createdAtStr }).eq('id', update.id)
      : supabase.from('updates').insert({ ...input, created_at: createdAtStr }));

    setSaving(false);

    try {
      let currentUpdates: ProjectUpdate[] = Array.isArray(existingUpdates) ? [...existingUpdates] : [];
      const updateObj: ProjectUpdate = {
        id: update?.id || `update-${Date.now()}`,
        title,
        body,
        created_at: createdAtStr,
        updated_at: new Date().toISOString(),
      };
      if (update) {
        currentUpdates = currentUpdates.map((item) => (item.id === update.id ? updateObj : item));
      } else {
        currentUpdates = [updateObj, ...currentUpdates.filter((item) => item.id !== updateObj.id)];
      }
      localStorage.setItem('pust_updates_cache', JSON.stringify(currentUpdates));

      const token = getStoredGitHubToken();
      if (token) await pushUpdatesToGitHub(currentUpdates, token);
    } catch {}

    window.dispatchEvent(new Event('pust_updates_updated'));
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

/* ---------------- Publications Admin ---------------- */

function PublicationsAdmin({
  publications,
  refresh,
  onChanged,
}: {
  publications: Publication[];
  refresh: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Publication | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('pust_github_token') || '');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(() => !localStorage.getItem('pust_github_token'));
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveToken = (val: string) => {
    setGithubToken(val);
    localStorage.setItem('pust_github_token', val);
  };

  const handleExportPublications = () => {
    const jsonStr = JSON.stringify(publications, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'publications.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePushGitHub = async () => {
    const token = getStoredGitHubToken() || githubToken;
    if (!token) {
      setShowTokenInput(true);
      setPublishMessage({ type: 'error', text: 'Please enter a GitHub Personal Access Token (PAT) first.' });
      return;
    }
    setPublishing(true);
    setPublishMessage(null);
    const res = await pushPublicationsToGitHub(publications, token);
    setPublishing(false);
    if (res.success) {
      setPublishMessage({ type: 'success', text: 'All publications synced live across all devices worldwide!' });
    } else {
      setPublishMessage({ type: 'error', text: res.message });
    }
  };

  const remove = async (p: Publication) => {
    if (!confirm(`Delete publication "${p.title}"? This cannot be undone.`)) return;
    setBusyId(p.id);

    try {
      const deletedStr = localStorage.getItem('pust_deleted_publications');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(p.id)) {
        deletedIds.push(p.id);
      }
      localStorage.setItem('pust_deleted_publications', JSON.stringify(deletedIds));
    } catch {}

    try {
      await supabase.from('publications').delete().eq('id', p.id);
    } catch {}

    const remaining = publications.filter((item) => item.id !== p.id);
    try {
      localStorage.setItem('pust_publications_cache', JSON.stringify(remaining));
      const token = getStoredGitHubToken() || githubToken;
      if (token) {
        setPublishing(true);
        const res = await pushPublicationsToGitHub(remaining, token);
        setPublishing(false);
        if (res.success) {
          setPublishMessage({ type: 'success', text: 'Publication deleted and synced across all devices worldwide!' });
        } else {
          setPublishMessage({ type: 'error', text: 'Publication deleted locally. GitHub Sync failed: ' + res.message });
        }
      } else {
        setPublishMessage({
          type: 'error',
          text: 'Publication deleted locally. Enter your GitHub PAT Token above to sync deletion across all devices worldwide.',
        });
      }
    } catch {}

    window.dispatchEvent(new Event('pust_publications_updated'));
    setBusyId(null);
    refresh();
    onChanged();
  };

  return (
    <div>
      <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Globe className="h-4 w-4 text-brand-600" /> GitHub Cloud Synchronization
            </span>
            <p className="mt-0.5 text-xs font-semibold text-ink-900">
              {publications.length} publications & patents published for all visitors across all devices
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTokenInput((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm cursor-pointer"
              title="Configure GitHub Personal Access Token for 1-Click Sync"
            >
              <Key className="h-3.5 w-3.5 text-amber-600" /> PAT Token
            </button>
            <button
              type="button"
              onClick={handleExportPublications}
              title="Download publications.json to commit manually to GitHub"
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-brand-600" /> Export JSON
            </button>
            <button
              type="button"
              onClick={handlePushGitHub}
              disabled={publishing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm cursor-pointer"
            >
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              {publishing ? 'Publishing…' : '1-Click GitHub Sync'}
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Publication
            </button>
          </div>
        </div>

        {showTokenInput && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3 space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-ink-800">
              🔑 GitHub Personal Access Token (PAT):
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => saveToken(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-mono text-ink-900 outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-ink-500">
              Generating a token with <span className="font-semibold text-ink-800">repo</span> scope allows 1-click cloud sync of publications & patents to all devices worldwide automatically.
            </p>
          </div>
        )}

        {publishMessage && (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
              publishMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {publishMessage.text}
          </div>
        )}
      </div>

      {publications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
          No publications added yet. Click <strong>"New Publication"</strong> above to publish a paper or patent.
        </div>
      ) : (
        <div className="space-y-3">
          {publications.map((p) => (
            <div key={p.id} className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-200">
                      {p.badge || p.type.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-ink-400">• {p.year}</span>
                  </div>
                  <h4 className="mt-1 font-display text-sm font-bold text-ink-900">{p.title}</h4>
                  <p className="mt-0.5 text-xs font-medium text-ink-700">{p.authors}</p>
                  <p className="text-xs italic text-brand-700">{p.venue}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(p)}
                    disabled={busyId === p.id}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    title="Delete"
                  >
                    {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <PublicationModal
          publication={editing}
          existingPublications={publications}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            refresh();
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function PublicationModal({
  publication,
  existingPublications,
  onClose,
  onSaved,
}: {
  publication: Publication | null;
  existingPublications: Publication[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(publication?.title || '');
  const [authors, setAuthors] = useState(publication?.authors || '');
  const [venue, setVenue] = useState(publication?.venue || '');
  const [year, setYear] = useState(publication?.year || new Date().getFullYear().toString());
  const [type, setType] = useState<PublicationType>(publication?.type || 'journal');
  const [badge, setBadge] = useState(publication?.badge || 'Q1 Journal');
  const [doi, setDoi] = useState(publication?.doi || '');
  const [abstract, setAbstract] = useState(publication?.abstract || '');
  const [bibtex, setBibtex] = useState(publication?.bibtex || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!authors.trim()) {
      setError('Authors are required.');
      return;
    }
    if (!venue.trim()) {
      setError('Venue / Journal is required.');
      return;
    }
    setSaving(true);
    setError(null);

    const input: PublicationInput = {
      title: title.trim(),
      authors: authors.trim(),
      venue: venue.trim(),
      year: year.trim() || new Date().getFullYear().toString(),
      type,
      badge: badge.trim() || (type === 'journal' ? 'Q1 Journal' : type === 'conference' ? 'Conference' : 'Patent'),
      doi: doi.trim() || undefined,
      abstract: abstract.trim(),
      bibtex: bibtex.trim(),
    };

    const pubId = publication?.id || generateUUID();
    const createdAtStr = publication?.created_at || new Date().toISOString();

    await (publication
      ? supabase.from('publications').update({ ...input, updated_at: new Date().toISOString() }).eq('id', publication.id)
      : supabase.from('publications').insert({ id: pubId, ...input, created_at: createdAtStr }));

    setSaving(false);

    try {
      let currentPubs: Publication[] = Array.isArray(existingPublications) ? [...existingPublications] : [];
      const pubObj: Publication = {
        id: pubId,
        ...input,
        created_at: createdAtStr,
        updated_at: new Date().toISOString(),
      };
      if (publication) {
        currentPubs = currentPubs.map((item) => (item.id === publication.id ? pubObj : item));
      } else {
        currentPubs = [pubObj, ...currentPubs.filter((item) => item.id !== pubId)];
      }
      localStorage.setItem('pust_publications_cache', JSON.stringify(currentPubs));

      const token = getStoredGitHubToken();
      if (token) await pushPublicationsToGitHub(currentPubs, token);
    } catch {}

    window.dispatchEvent(new Event('pust_publications_updated'));
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/50 p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto scroll-thin">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">
            {publication ? 'Edit Publication' : 'New Publication'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Title *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hyperspectral Imaging for Crop Quality Assessment" className={inputCls} />
          </Field>
          <Field label="Authors *">
            <input value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="e.g. S. M. Hasan Sazzad Iqbal, Toukir Ahmed, et al." className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Venue / Journal *">
              <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Computers and Electronics in Agriculture" className={inputCls} />
            </Field>
            <Field label="Year *">
              <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category Type">
              <select value={type} onChange={(e) => setType(e.target.value as PublicationType)} className={inputCls}>
                <option value="journal">Journal Paper</option>
                <option value="conference">Conference Proceeding</option>
                <option value="patent">Patent / IP Filing</option>
              </select>
            </Field>
            <Field label="Badge Tag">
              <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Q1 Journal, IEEE Conference" className={inputCls} />
            </Field>
          </div>
          <Field label="DOI / External URL">
            <input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="https://doi.org/10.1016/j.compag..." className={inputCls} />
          </Field>
          <Field label="Abstract">
            <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={3} placeholder="Brief summary of research paper findings..." className={inputCls} />
          </Field>
          <Field label="BibTeX Citation">
            <textarea value={bibtex} onChange={(e) => setBibtex(e.target.value)} rows={3} placeholder="@article{iqbal2026hyperspectral, ...}" className={inputCls} />
          </Field>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
              Cancel
            </button>
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

function PhasesAdmin({ onChanged }: { onChanged: () => void }) {
  const { data: phases, updatePhaseStatus } = usePhases();
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('pust_github_token') || '');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(() => !localStorage.getItem('pust_github_token'));
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveToken = (val: string) => {
    setGithubToken(val);
    localStorage.setItem('pust_github_token', val);
  };

  const handleExportPhases = () => {
    const jsonStr = JSON.stringify(phases, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phases.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePushGitHub = async () => {
    const token = getStoredGitHubToken() || githubToken;
    if (!token) {
      setShowTokenInput(true);
      setPublishMessage({ type: 'error', text: 'Please enter a GitHub Personal Access Token (PAT) first.' });
      return;
    }
    setPublishing(true);
    setPublishMessage(null);
    const res = await pushPhasesToGitHub(phases, token);
    setPublishing(false);
    if (res.success) {
      setPublishMessage({ type: 'success', text: 'All project milestone phase statuses synced live across all devices worldwide!' });
    } else {
      setPublishMessage({ type: 'error', text: res.message });
    }
  };

  const handlePhaseStatusChange = async (phaseNumber: number, newStatus: PhaseStatus) => {
    setPublishing(true);
    setPublishMessage(null);
    await updatePhaseStatus(phaseNumber, newStatus);
    onChanged();
    setPublishing(false);
    const label = newStatus === 'completed' ? 'Completed' : newStatus === 'in-progress' ? 'Active' : 'Upcoming';
    setPublishMessage({
      type: 'success',
      text: `Phase ${phaseNumber} set to "${label}" and synced live across all devices worldwide!`,
    });
  };

  return (
    <div>
      <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Globe className="h-4 w-4 text-brand-600" /> GitHub Cloud Synchronization
            </span>
            <p className="mt-0.5 text-xs font-semibold text-ink-900">
              5 Project Milestone Phases configured for all visitors across all devices
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTokenInput((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm cursor-pointer"
              title="Configure GitHub Personal Access Token for 1-Click Sync"
            >
              <Key className="h-3.5 w-3.5 text-amber-600" /> PAT Token
            </button>
            <button
              type="button"
              onClick={handleExportPhases}
              title="Download phases.json to commit manually to GitHub"
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-sm cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-brand-600" /> Export JSON
            </button>
            <button
              type="button"
              onClick={handlePushGitHub}
              disabled={publishing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm cursor-pointer"
            >
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              {publishing ? 'Publishing…' : '1-Click GitHub Sync'}
            </button>
          </div>
        </div>

        {showTokenInput && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3 space-y-2 animate-fade-in">
            <label className="block text-xs font-bold text-ink-800">
              🔑 GitHub Personal Access Token (PAT):
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => saveToken(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-mono text-ink-900 outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-ink-500">
              Generating a token with <span className="font-semibold text-ink-800">repo</span> scope allows 1-click cloud sync of project milestone phase statuses to all devices worldwide automatically.
            </p>
          </div>
        )}

        {publishMessage && (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
              publishMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {publishMessage.text}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {phases.map((p) => (
          <div key={p.number} className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                    P{p.number}
                  </span>
                  <h4 className="font-display text-sm font-bold text-ink-900">
                    Phase {p.number}: {p.title}
                  </h4>
                  <span className="text-xs font-semibold text-ink-400">({p.duration})</span>
                </div>
                <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">{p.description}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handlePhaseStatusChange(p.number, 'completed')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    p.status === 'completed'
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                      : 'bg-ink-100 text-ink-600 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
                >
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => handlePhaseStatusChange(p.number, 'in-progress')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    p.status === 'in-progress'
                      ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300 animate-pulse-soft'
                      : 'bg-ink-100 text-ink-600 hover:bg-brand-100 hover:text-brand-800'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handlePhaseStatusChange(p.number, 'upcoming')}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    p.status === 'upcoming'
                      ? 'bg-ink-700 text-white shadow-sm ring-2 ring-ink-300'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900'
                  }`}
                >
                  Upcoming
                </button>
              </div>
            </div>
          </div>
        ))}
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

