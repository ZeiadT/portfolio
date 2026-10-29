import type { ProfileData } from '@/domain/types';

/**
 * Central Profile Data Record
 * Houses user editorial copy, role title, personal quote, contact details, and social links.
 */
export const PROFILE_DATA: ProfileData = {
  title: 'Mobile Developer',
  quote: '“I love turning complex problems into simple, reliable systems that teams can trust.”',
  summary:
    'Dedicated software developer building deterministic, high-performance applications and reliable systems that engineering teams and users can trust. Passionate about clean architecture, fluid interaction mechanics, and robust engineering standards that deliver seamless digital experiences.',
  location: 'Cairo, Egypt',
  contact: {
    phone: '+201019880091',
    phoneFormatted: '+20 1019880091',
    email: 'contact@zeiad.dev',
  },
  links: [
    {
      label: 'GitHub',
      url: 'https://github.com/zeiad-mohammed',
      icon: 'github',
      ariaLabel: 'View GitHub Profile',
    },
    {
      label: 'Codewars',
      url: 'https://www.codewars.com/users/zeiad-mohammed',
      icon: 'codewars',
      ariaLabel: 'View Codewars Profile',
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/zeiad-mohammed',
      icon: 'linkedin',
      ariaLabel: 'View LinkedIn Profile',
    },
  ],
  avatar: {
    src: '/profile.jpg',
    alt: 'Zeiad Mohammed Portrait',
    fallbackInitials: 'ZM',
  },
  pillars: [
    'Mobile & Systems Architecture',
    'Deterministic Performance',
    'Kinetic Motion & WebGL',
    'Clean Architecture & TDD',
  ],
};
