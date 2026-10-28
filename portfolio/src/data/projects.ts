import type { Project } from '@/domain/types';

/**
 * Portfolio Projects Data Hub
 * To add a new project, simply append a typed Project object to this list.
 */
export const PROJECTS: Project[] = [
  {
    id: 'dusk',
    title: 'Dusk',
    subtitle: 'Weather Forecasting Application',
    category: 'Android',
    year: '2025',
    tags: ['Kotlin', 'Jetpack Compose', 'MVVM/MVI', 'Room', 'Offline-First'],
    description: 'Offline-first weather forecasting application built with Clean Architecture, featuring real-time forecasts, alerts, and location caching.',
    links: {
      github: 'https://github.com/ZeiadT/Dusk',
    },
    media: {
      thumbnail: '/assets/projects/dusk.png',
    },
    accentColor: '#4f46e5',
  },
  {
    id: 'cargo',
    title: 'Cargo',
    subtitle: 'Cross-Platform Logistics & Fleet Tracker',
    category: 'Cross-Platform',
    year: '2025',
    tags: ['KMP', 'Compose Multiplatform', '.NET', 'Microservices', 'Azure'],
    description: 'Logistics platform connecting shippers and drivers via live GPS tracking, QR-code delivery verification, and in-app messaging.',
    links: {
      github: 'https://github.com/Cargo-Org',
    },
    media: {
      thumbnail: '/assets/projects/cargo.png',
    },
    accentColor: '#0ea5e9',
  },
  {
    id: 'gusto',
    title: 'Gusto',
    subtitle: 'Culinary & Meal Planning Assistant',
    category: 'Android',
    year: '2024',
    tags: ['Java', 'Android', 'MVVM', 'Retrofit', 'RxJava', 'Room'],
    description: 'Meal planning application integrating TheMealDB API for recipe discovery, offline favorites access, and scheduled dietary routines.',
    links: {
      github: 'https://github.com/ZeiadT/Gusto',
    },
    media: {
      thumbnail: '/assets/projects/gusto.png',
    },
    accentColor: '#f97316',
  },
  {
    id: 'sportx',
    title: 'SportX',
    subtitle: 'Live Sports & Match Tracking',
    category: 'iOS',
    year: '2024',
    tags: ['Swift', 'iOS', 'MVP', 'Core Data', 'REST API'],
    description: 'Sports tracking app displaying leagues, fixtures, and roster insights with persistent offline favorites.',
    links: {
      github: 'https://github.com/Sporto-org/Sportx',
    },
    media: {
      thumbnail: '/assets/projects/sportx.png',
    },
    accentColor: '#10b981',
  },
  {
    id: 'elevated',
    title: 'ElevatED',
    subtitle: 'AI-Powered Educational Platform',
    category: 'Full-Stack',
    year: '2025',
    tags: ['Flutter', 'Dart', 'Python', 'BLoC', 'AI Audio Analysis'],
    description: 'Automated content validation via audio analysis models and a high-throughput media pipeline using FTP and reactive state management.',
    links: {
      github: 'https://github.com/ZeiadT/ElevateEd--Learning_APP',
    },
    media: {
      thumbnail: '/assets/projects/elevated.png',
    },
    accentColor: '#8b5cf6',
  },
  {
    id: 'wireless-mouse',
    title: 'Wireless Mouse',
    subtitle: 'Low-Latency Remote PC Controller',
    category: 'Full-Stack',
    year: '2024',
    tags: ['Flutter', 'C#', '.NET', 'WebSockets', 'Windows API'],
    description: 'Gesture-based cursor navigation with low-latency socket communication between mobile device and Windows desktop OS.',
    links: {},
    media: {
      thumbnail: '/assets/projects/wireless-mouse.png',
    },
    accentColor: '#06b6d4',
  },
];
