import type { ThemeStyle } from '@/stores/settings';

import type { MapIconKind } from './types';

export const mapIconArt: Record<
  MapIconKind['kind'],
  Record<ThemeStyle, string>
> = {
  arrow: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    game: '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M3 0h1v1h1v1h1v1h1v1h-2v3h-3v-3h-2v-1h1v-1h1v-1h1z"/></svg>',
  },
  exit: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 0h4v1h-4zM0 1h1v5h-1zM0 6h4v1h-4zM2 3h6v1h-6zM5 1h1v1h-1zM5 2h2v1h-2zM5 4h2v1h-2zM5 5h1v1h-1z"/></svg>',
  },
  stairs: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h5v-5h5v-5h5V6h3"/></svg>',
    game: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M6 0h2v8h-8v-2h2v-2h2v-2h2z"/></svg>',
  },
  ladder: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v18"/><path d="M16 3v18"/><path d="M8 7h8"/><path d="M8 12h8"/><path d="M8 17h8"/></svg>',
    game: '<svg viewBox="0 0 7 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h1v8h-1zM5 0h1v8h-1zM2 1h3v1h-3zM2 4h3v1h-3zM2 7h3v1h-3z"/></svg>',
  },
  teleport: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="18" rx="9" ry="3.5"/><path d="M7 14V7"/><path d="M12 14V3"/><path d="M17 14V7"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 1h1v3h-1zM3 0h2v4h-2zM6 1h1v3h-1zM1 5h6v1h-6zM0 6h8v1h-8z"/></svg>',
  },
  current: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 1h1v1h-1zM1 0h2v1h-2zM3 1h2v1h-2zM5 0h2v1h-2zM7 1h1v1h-1zM0 5h1v1h-1zM1 4h2v1h-2zM3 5h2v1h-2zM5 4h2v1h-2zM7 5h1v1h-1z"/></svg>',
  },
  hole: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="6"/><ellipse cx="12" cy="13" rx="5.5" ry="2.5" fill="currentColor"/></svg>',
    game: '<svg viewBox="0 0 8 6" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 0h4v1h-4zM1 1h1v1h-1zM6 1h1v1h-1zM0 2h1v2h-1zM7 2h1v2h-1zM2 2h4v2h-4zM1 4h1v1h-1zM6 4h1v1h-1zM2 5h4v1h-4z"/></svg>',
  },
  sign: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 13v8"/><path d="M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/></svg>',
    game: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M0 0h8v5h-8zM1 1h6v1h-6zM1 3h4v1h-4z"/><path fill="currentColor" d="M3 5h2v3h-2z"/></svg>',
  },
  register: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8v6H8z"/><path d="M5 9h14l2 5H3z"/><path d="M3 14h18v6H3z"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/></svg>',
    game: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M2 0h4v2h-4zM3 1h2v1h-2zM1 2h6v2h-6zM0 4h8v4h-8zM1 5h1v1h-1zM3 5h1v1h-1zM5 5h1v1h-1z"/></svg>',
  },
  door: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20H2"/><path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"/><path d="M11 4H8a2 2 0 0 0-2 2v14"/><path d="M14 12h.01"/><path d="M22 20h-3"/></svg>',
    game: '<svg viewBox="0 0 7 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M1 0h5v7h-5zM4 3h1v1h-1z"/><path fill="currentColor" d="M0 7h7v1h-7z"/></svg>',
  },
  cave: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20h20"/><path d="M4 20v-7a8 8 0 0 1 16 0v7"/><path d="M9 20v-3.5a3 3 0 0 1 6 0V20"/></svg>',
    game: '<svg data-wide="" viewBox="0 0 11 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M4 0h3v1h-3zM3 1h5v1h-5zM2 2h7v1h-7zM1 3h9v1h-9zM0 4h11v1h-11zM0 5h4v1h-4zM7 5h4v1h-4zM0 6h3v2h-3zM8 6h3v2h-3z"/></svg>',
  },
  gym: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/></svg>',
    game: '<svg data-wide="" viewBox="0 0 11 5" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 0h3v1h-3zM4 0h1v1h-1zM6 0h1v1h-1zM8 0h1v1h-1zM10 0h1v1h-1zM0 1h1v1h-1zM4 1h1v1h-1zM6 1h1v1h-1zM8 1h3v1h-3zM0 2h1v1h-1zM2 2h1v1h-1zM5 2h1v1h-1zM8 2h3v1h-3zM0 3h1v1h-1zM2 3h1v1h-1zM5 3h1v1h-1zM8 3h1v1h-1zM10 3h1v1h-1zM0 4h3v1h-3zM5 4h1v1h-1zM8 4h1v1h-1zM10 4h1v1h-1z"/></svg>',
  },
  start: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    game: '<svg data-wide="" viewBox="0 0 11 9" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M5 0h1v1h-1zM4 1h3v1h-3zM8 1h2v2h-2zM3 2h5v1h-5zM2 3h7v1h-7zM1 4h9v1h-9zM0 5h11v1h-11zM1 6h3v3h-3zM7 6h3v3h-3z"/></svg>',
  },
  league: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    game: '<svg data-wide="" viewBox="0 0 11 9" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h9v1h-9zM0 1h11v1h-11zM0 2h1v1h-1zM2 2h7v1h-7zM10 2h1v1h-1zM0 3h2v1h-2zM3 3h5v1h-5zM9 3h2v1h-2zM4 4h3v1h-3zM4 5h3v1h-3zM3 6h5v1h-5zM2 7h7v1h-7zM2 8h7v1h-7z"/></svg>',
  },
  legendary: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    game: '<svg data-wide="" viewBox="0 0 11 9" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M5 0h1v1h-1zM4 1h3v1h-3zM4 2h3v1h-3zM0 3h11v1h-11zM1 4h9v1h-9zM2 5h7v1h-7zM2 6h7v1h-7zM1 7h3v1h-3zM7 7h3v1h-3zM1 8h2v1h-2zM8 8h2v1h-2z"/></svg>',
  },
  mart: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    game: '<svg viewBox="0 0 7 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 0h3v1h-3zM1 1h1v1h-1zM5 1h1v1h-1zM0 2h7v1h-7zM0 3h7v1h-7zM0 4h7v1h-7zM0 5h7v1h-7zM0 6h7v1h-7zM0 7h7v1h-7z"/></svg>',
  },
  center: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h2v1h-2zM5 0h2v1h-2zM0 1h8v1h-8zM0 2h8v1h-8zM0 3h8v1h-8zM1 4h6v1h-6zM2 5h4v1h-4zM3 6h2v1h-2z"/></svg>',
  },
};

export const mapStepArt: Record<ThemeStyle, string> = {
  'tall-grass':
    '<svg viewBox="-3 -3 30 30" aria-hidden="true"><path d="M12 1.5 23 13h-6.5v9.5h-9V13H1z" fill="var(--step-ink)" stroke="var(--step-edge)" stroke-width="4.5" stroke-linejoin="round" paint-order="stroke"/></svg>',
  game: '<svg viewBox="0 0 9 9" shape-rendering="crispEdges" aria-hidden="true"><path fill="var(--step-edge)" d="M3 0h3v1h-3zM2 1h5v1h-5zM1 2h7v1h-7zM0 3h9v3h-9zM2 6h5v3h-5z"/><path fill="var(--step-ink)" d="M4 1h1v1h-1zM3 2h3v1h-3zM2 3h5v1h-5zM1 4h7v1h-7zM3 5h3v3h-3z"/></svg>',
};

export const zaDoorArt =
  '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="za-marker" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d8bd0"/><stop offset="1" stop-color="#0a3566"/></linearGradient></defs><path d="M10 1.5h12L30.5 10v12L22 30.5H10L1.5 22V10z" fill="url(#za-marker)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M11 23V10a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 23h15" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="18.5" cy="16.5" r="1.3" fill="#a6e22e"/></svg>';
