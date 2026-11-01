import type { ProfileData } from '@/domain/types';

/**
 * Central Profile Data Record
 * Houses user editorial copy, role title, personal quote, contact details, and social links.
 */
export const PROFILE_DATA: ProfileData = {
  title: 'Mobile Developer',
  quote: '“I love turning complex problems into simple, reliable systems that teams can trust.”',
  summary:
    'Mobile Application Developer experienced in native and cross-platform mobile application development, with background in backend development using (C#/.NET). Strong in OOP, design patterns, and clean architecture, focused on building scalable, user-centered applications and delivering clean, maintainable solutions in Agile environments.',
  location: 'Egypt',
  contact: {
    phone: '+201019880091',
    phoneFormatted: '+20 1019880091',
    email: 'zeiadm4business@gmail.com',
  },
  links: [
    {
      label: 'GitHub',
      url: 'https://github.com/ZeiadT',
      icon: 'github',
      ariaLabel: 'View GitHub Profile',
    },
    {
      label: 'Codewars',
      url: 'https://www.codewars.com/users/ZeiadT',
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
  education: [
    {
      degree: '9-Month Professional Diploma',
      period: 'Oct 2025 – Sep 2026',
      field: 'Mobile Application Development (Native)',
      institution: 'Information Technology Institute (ITI), Smart Village Branch',
    },
    {
      title: 'Faculty of Computers and Artificial Intelligence',
      degree: 'Faculty of Computers and Artificial Intelligence',
      track: 'B.Sc. in Scientific Computing',
      field: 'B.Sc. in Scientific Computing',
      location: 'Benha University, Benha, Egypt',
      institution: 'Benha University, Benha, Egypt',
      period: 'Oct 2021 – Jun 2025',
    },
    {
      degree: 'Digital Egypt Pioneers Initiative (DEPI)',
      period: 'Jun 2024 – Dec 2024',
      field: 'Mobile Application Development (Native)',
      institution: 'Ministry of Communications and Information Technology (MCIT) – Benha, Egypt',
    },
  ],
  resumeUrl:
    'https://drive.google.com/file/d/1nxESDH7D4pVdaa_3cl7Y7QlMjlBNnRQl/view?usp=sharing',
};
