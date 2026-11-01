/**
 * Domain Entities & Contracts
 * Pure types - zero UI or external framework dependencies.
 */

export interface ProjectMedia {
  thumbnail: string;
  heroVideo?: string;
  images?: string[];
}

export interface ProjectLinks {
  github?: string;
  live?: string;
  doc?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'Android' | 'Cross-Platform' | 'iOS' | 'Full-Stack' | 'Other';
  year: string;
  tags: string[];
  description: string;
  links: ProjectLinks;
  media: ProjectMedia;
  accentColor?: string;
}

export interface ProfileLink {
  label: string;
  url: string;
  icon: 'github' | 'codewars' | 'linkedin' | 'external';
  ariaLabel?: string;
}

export interface ProfileContact {
  phone: string;
  phoneFormatted: string;
  email: string;
}

export interface ProfileAvatarConfig {
  src: string;
  alt: string;
  fallbackInitials: string;
}

export interface ProfileEducationEntry {
  institution?: string;
  degree?: string;
  period: string;
  field?: string;
  details?: string[];
  // Friendly aliases
  title?: string;
  track?: string;
  location?: string;
}

export interface ProfileData {
  title: string;
  quote: string;
  summary: string;
  location: string;
  contact: ProfileContact;
  links: ProfileLink[];
  avatar: ProfileAvatarConfig;
  pillars?: string[];
  education?: ProfileEducationEntry | ProfileEducationEntry[];
  resumeUrl?: string;
}

/**
 * Standard lifecycle contract for any visual / interactive engine
 * (3D Carousel, Canvas Marquee Band, Glare Overlays, etc.)
 */
export interface Engine {
  readonly id: string;
  mount(container: HTMLElement): void;
  destroy(): void;
  resize?(): void;
}

/**
 * Global navigation / portfolio views
 */
export type ViewState = 'home' | 'projects' | 'about' | 'contact' | 'wall';

// --- Project Deep-Dive Contract ---
export interface ProjectDetails extends Project {
  longDescription?: string;
  architectureDiagram?: string;
  architectureHighlights?: string[];
  metrics?: { label: string; value: string; detail?: string }[];
}

// --- Skills Domain Contract ---
export interface SkillItem {
  name: string;
  level?: 'Expert' | 'Advanced' | 'Proficient';
  highlight?: boolean;
  tag?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color?: string;
  skills: SkillItem[];
}

// --- Wall (Guestbook Canvas) Domain Contract ---
export type WallItemType = 'note' | 'drawing' | 'sticker' | 'media';

export interface WallItem {
  id: string;
  type: WallItemType;
  author: string;
  timestamp: number;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  color?: string;
  content: {
    text?: string;
    drawingDataUrl?: string;
    imageUrl?: string;
  };
  likes: number;
}

// --- Contact Transmission Contract ---
export interface ContactPayload {
  name: string;
  emailOrHandle: string;
  channel: 'telegram' | 'email';
  message: string;
  timestamp: number;
}
