import type { Priority } from './types';
import { supabase } from './supabase';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getAssetUrl(path: string): string {
  if (!path) return '';
  let cleanPath = path.trim();
  if (cleanPath.startsWith('./')) cleanPath = cleanPath.slice(2);
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
  const baseUrl = import.meta.env.BASE_URL || '/';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}${cleanPath}`;
}

export function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((now - d) / 1000);
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = diff;
  let unit = 'second';
  for (const [span, name] of units) {
    if (Math.abs(value) < span) {
      unit = name;
      break;
    }
    value = Math.round(value / span);
    unit = name;
  }
  if (value === 0) return 'just now';
  const plural = Math.abs(value) === 1 ? '' : 's';
  return `${value} ${unit}${plural} ago`;
}

export const priorityStyles: Record<Priority, { label: string; badge: string; dot: string }> = {
  high: {
    label: 'High Priority',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-500',
  },
  normal: {
    label: 'Notice',
    badge: 'bg-brand-50 text-brand-700 ring-brand-200',
    dot: 'bg-brand-500',
  },
  low: {
    label: 'Info',
    badge: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  },
};

export const statusColorMap: Record<string, { dot: string; text: string; bg: string; ring: string }> = {
  amber: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  green: { dot: 'bg-brand-500', text: 'text-brand-700', bg: 'bg-brand-50', ring: 'ring-brand-200' },
  blue: { dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  red: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200' },
  slate: { dot: 'bg-ink-500', text: 'text-ink-700', bg: 'bg-ink-100', ring: 'ring-ink-200' },
};

export function getStatusColor(key: string) {
  return statusColorMap[key] ?? statusColorMap.slate;
}

export function detectAttachmentType(filename: string, mimeType?: string): 'pdf' | 'word' | 'excel' | 'image' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) return 'pdf';
  if (['doc', 'docx'].includes(ext) || mimeType?.includes('word')) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType?.includes('sheet') || mimeType?.includes('excel') || mimeType?.includes('csv')) return 'excel';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) return 'image';
  return 'other';
}

export const attachmentMeta = {
  pdf: {
    label: 'PDF Document',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    iconBg: 'bg-red-100 text-red-600',
  },
  word: {
    label: 'Word Document',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  excel: {
    label: 'Excel Spreadsheet',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  image: {
    label: 'Image',
    badge: 'bg-purple-50 text-purple-700 ring-purple-200',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  other: {
    label: 'Attachment',
    badge: 'bg-ink-100 text-ink-700 ring-ink-200',
    iconBg: 'bg-ink-100 text-ink-600',
  },
};
export function parseNoticeAttachment(notice: {
  body?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: 'pdf' | 'word' | 'excel' | 'image' | 'other';
}): {
  cleanBody: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType: 'pdf' | 'word' | 'excel' | 'image' | 'other';
} {
  let cleanBody = notice.body || '';
  let attachmentUrl = notice.attachment_url;
  let attachmentName = notice.attachment_name;
  let attachmentType = notice.attachment_type;

  // Match [ATTACHMENT:{...}] anywhere at the end of body with optional leading newlines/spaces
  const match = cleanBody.match(/[\s\n]*\[ATTACHMENT:([\s\S]*)\]$/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      attachmentUrl = attachmentUrl || parsed.url;
      attachmentName = attachmentName || parsed.name;
      attachmentType = attachmentType || parsed.type;
    } catch (e) {
      // ignore
    }
  }

  // Strip all raw [ATTACHMENT:...] tags from cleanBody so base64 strings never leak into text rendering!
  cleanBody = cleanBody.replace(/[\s\n]*\[ATTACHMENT:[\s\S]*?\]/g, '').trim();

  let finalType = attachmentType;
  if (!finalType && attachmentName) {
    finalType = detectAttachmentType(attachmentName);
  }
  if (!finalType && attachmentUrl) {
    finalType = detectAttachmentType(attachmentUrl);
  }

  return {
    cleanBody,
    attachmentUrl: attachmentUrl || undefined,
    attachmentName: attachmentName || undefined,
    attachmentType: finalType || 'other',
  };
}

export async function handleDownload(url: string, filename?: string) {
  if (!url) return;
  const name = filename || url.split('/').pop() || 'notice_attachment';
  if (url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export async function pushNoticesToGitHub(
  notices: any[],
  token: string
): Promise<{ success: boolean; message: string }> {
  const cleanToken = token.trim();
  if (!cleanToken) return { success: false, message: 'GitHub PAT token is required.' };

  const repo = 'ICSETEP-PUSTCSE-B9/ICSETEP-PUSTCSE-B9.github.io';
  const path = 'public/notices.json';
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const authHeader = `token ${cleanToken}`;

  try {
    let sha = '';
    const getRes = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
      },
    });

    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    const jsonString = JSON.stringify(notices, null, 2);
    const bytes = new TextEncoder().encode(jsonString);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const content = btoa(binary);

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update notices.json via Admin Dashboard',
        content,
        sha: sha || undefined,
      }),
    });

    if (!putRes.ok) {
      const errJson = await putRes.json();
      if (putRes.status === 404) {
        return {
          success: false,
          message: 'GitHub Token error (Not Found). Ensure your PAT token has "repo" scope permission enabled.',
        };
      }
      return { success: false, message: errJson.message || 'Failed to publish to GitHub.' };
    }

    return { success: true, message: 'Successfully published notices.json directly to GitHub!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error while publishing to GitHub.' };
  }
}

export async function uploadFileToGitHub(
  file: File,
  token: string
): Promise<{ success: boolean; url?: string; message: string }> {
  const cleanToken = token.trim();
  if (!cleanToken) return { success: false, message: 'GitHub PAT token is required.' };

  const repo = 'ICSETEP-PUSTCSE-B9/ICSETEP-PUSTCSE-B9.github.io';
  const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const fileName = `${Date.now()}_${cleanName}`;
  const path = `public/uploads/${fileName}`;
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const authHeader = `token ${cleanToken}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const content = btoa(binary);

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload attachment ${fileName} via Admin Dashboard`,
        content,
      }),
    });

    if (!putRes.ok) {
      const errJson = await putRes.json();
      return { success: false, message: errJson.message || 'Failed to upload attachment to GitHub.' };
    }

    const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${path}`;
    return { success: true, url: rawUrl, message: 'File uploaded to GitHub successfully!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error while uploading attachment.' };
  }
}

export async function uploadFileToSupabaseStorage(
  file: File
): Promise<{ success: boolean; url?: string; message: string }> {
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const fileName = `${Date.now()}_${cleanName}`;

    // Try 'notices' bucket first, fallback to 'public'
    let targetBucket = 'notices';
    let { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      targetBucket = 'public';
      const fallbackRes = await supabase.storage
        .from(targetBucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error || !data) {
      return { success: false, message: error?.message || 'Failed to upload to Supabase storage.' };
    }

    const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
    return {
      success: true,
      url: urlData?.publicUrl || '',
      message: 'File uploaded to Supabase Storage successfully!',
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Error uploading file to Supabase Storage.' };
  }
}



