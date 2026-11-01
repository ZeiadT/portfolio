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
export type ViewState = 'home' | 'projects' | 'about' | 'contact';
