export const colors = {
  neutrals: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
  },
  archetypes: {
    midnightCinephile: {
      start: '#6366F1',
      end: '#8B5CF6',
      name: 'Midnight Cinephile',
      tagline: 'Lost in the silver screen\'s embrace',
    },
    feelGoodExplorer: {
      start: '#F59E0B',
      end: '#EC4899',
      name: 'Feel-Good Explorer',
      tagline: 'Chasing joy, one frame at a time',
    },
    thrillerSeeker: {
      start: '#EF4444',
      end: '#991B1B',
      name: 'Thriller Seeker',
      tagline: 'Thriving on edge-of-seat moments',
    },
    indieWanderer: {
      start: '#10B981',
      end: '#059669',
      name: 'Indie Wanderer',
      tagline: 'Finding beauty in the unconventional',
    },
    epicAdventurer: {
      start: '#3B82F6',
      end: '#1E40AF',
      name: 'Epic Adventurer',
      tagline: 'Seeking worlds beyond imagination',
    },
    comfortCurator: {
      start: '#A78BFA',
      end: '#DDD6FE',
      name: 'Comfort Curator',
      tagline: 'Your sanctuary of familiar stories',
    },
    mindBender: {
      start: '#06B6D4',
      end: '#0891B2',
      name: 'Mind Bender',
      tagline: 'Unraveling cinematic mysteries',
    },
    classicRomantic: {
      start: '#F472B6',
      end: '#EC4899',
      name: 'Classic Romantic',
      tagline: 'Believing in love\'s timeless power',
    },
  },
};

export const spacing = {
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
  40: '40px',
  48: '48px',
  56: '56px',
  64: '64px',
  80: '80px',
  96: '96px',
  120: '120px',
  160: '160px',
};

export const borderRadius = {
  small: '8px',
  medium: '20px',
  large: '24px',
  xl: '32px',
  pill: '9999px',
};

export const shadows = {
  soft: '0 4px 24px rgba(0, 0, 0, 0.06)',
  medium: '0 8px 32px rgba(0, 0, 0, 0.08)',
  strong: '0 12px 48px rgba(0, 0, 0, 0.12)',
  glow: (color: string, opacity = 0.12) => `0 0 0 6px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
};

export const typography = {
  display: {
    size: '64px',
    weight: '900',
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
  },
  h1: {
    size: '48px',
    weight: '800',
    lineHeight: '1.2',
  },
  h2: {
    size: '36px',
    weight: '700',
    lineHeight: '1.3',
  },
  h3: {
    size: '28px',
    weight: '600',
    lineHeight: '1.4',
  },
  bodyLarge: {
    size: '20px',
    weight: '400',
    lineHeight: '1.7',
  },
  body: {
    size: '18px',
    weight: '400',
    lineHeight: '1.6',
  },
  small: {
    size: '15px',
    weight: '400',
    lineHeight: '1.5',
  },
  caption: {
    size: '14px',
    weight: '400',
    lineHeight: '1.5',
    opacity: '0.7',
  },
};

export const getArchetypeGradient = (archetype: keyof typeof colors.archetypes, angle = 120) => {
  const arch = colors.archetypes[archetype];
  return `linear-gradient(${angle}deg, ${arch.start}, ${arch.end})`;
};

export const getArchetypeRadialGradient = (archetype: keyof typeof colors.archetypes) => {
  const arch = colors.archetypes[archetype];
  return `radial-gradient(circle, ${arch.start}, ${arch.end})`;
};

export const getArchetypeGlowShadow = (archetype: keyof typeof colors.archetypes, opacity = 0.12) => {
  const arch = colors.archetypes[archetype];
  const r = parseInt(arch.start.slice(1, 3), 16);
  const g = parseInt(arch.start.slice(3, 5), 16);
  const b = parseInt(arch.start.slice(5, 7), 16);
  return `0 0 0 6px rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const animations = {
  easeExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeSmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  durations: {
    fast: '200ms',
    medium: '350ms',
    slow: '600ms',
    verySlow: '700ms',
  },
};

export const archetypeMapping: Record<string, keyof typeof colors.archetypes> = {
  'midnight-cinephile': 'midnightCinephile',
  'feel-good-explorer': 'feelGoodExplorer',
  'thriller-seeker': 'thrillerSeeker',
  'indie-wanderer': 'indieWanderer',
  'epic-adventurer': 'epicAdventurer',
  'comfort-curator': 'comfortCurator',
  'mind-bender': 'mindBender',
  'classic-romantic': 'classicRomantic',
};

export const getArchetypeBySlug = (slug: string) => {
  return archetypeMapping[slug] || 'epicAdventurer';
};
