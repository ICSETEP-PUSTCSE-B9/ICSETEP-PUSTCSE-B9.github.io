export type Priority = 'low' | 'normal' | 'high';

export interface ProjectInfo {
  id: number;
  title: string;
  tagline: string;
  description: string;
  status: string;
  status_color: string;
  metric1_label: string;
  metric1_value: string;
  metric2_label: string;
  metric2_value: string;
  metric3_label: string;
  metric3_value: string;
  metric4_label: string;
  metric4_value: string;
  updated_at: string;
}

export type AttachmentType = 'pdf' | 'word' | 'excel' | 'image' | 'other';

export interface Notice {
  id: string;
  title: string;
  body: string;
  priority: Priority;
  is_pinned: boolean;
  is_active: boolean;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: AttachmentType;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectInfoInput {
  title: string;
  tagline: string;
  description: string;
  status: string;
  status_color: string;
  metric1_label: string;
  metric1_value: string;
  metric2_label: string;
  metric2_value: string;
  metric3_label: string;
  metric3_value: string;
  metric4_label: string;
  metric4_value: string;
}

export interface NoticeInput {
  title: string;
  body: string;
  priority: Priority;
  is_pinned: boolean;
  is_active: boolean;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: AttachmentType;
}

export interface UpdateInput {
  title: string;
  body: string;
}

export type PhaseStatus = 'completed' | 'in-progress' | 'upcoming';

export interface ProjectPhase {
  number: number;
  title: string;
  duration: string;
  status: PhaseStatus;
  description: string;
  deliverables: string[];
}

export type PublicationType = 'journal' | 'conference' | 'patent';

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  type: PublicationType;
  badge: string;
  doi?: string;
  abstract: string;
  bibtex: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublicationInput {
  title: string;
  authors: string;
  venue: string;
  year: string;
  type: PublicationType;
  badge: string;
  doi?: string;
  abstract: string;
  bibtex: string;
}
