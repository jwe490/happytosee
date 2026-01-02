export const designSystem = {
  typography: {
    fonts: {
      primary: 'Inter, system-ui, -apple-system, sans-serif',
    },
    sizes: {
      xs: '14px',
      sm: '16px',
      base: '18px',
      lg: '20px',
      xl: '24px',
      '2xl': '28px',
      '3xl': '32px',
      '4xl': '40px',
      '5xl': '48px',
    },
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeights: {
      body: 1.5,
      heading: 1.2,
    },
    letterSpacing: {
      tight: '-0.02em',
    },
  },

  colors: {
    neutrals: {
      50: '#F8F9FA',
      100: '#E9ECEF',
      300: '#ADB5BD',
      600: '#495057',
      900: '#212529',
    },
    archetypes: {
      'midnight-cinephile': {
        gradient: 'from-[#2D3748] via-[#4A5568] to-[#1A202C]',
        primary: '#4A5568',
      },
      'feel-good-explorer': {
        gradient: 'from-[#F6AD55] via-[#ED8936] to-[#DD6B20]',
        primary: '#ED8936',
      },
      'thriller-seeker': {
        gradient: 'from-[#E53E3E] via-[#C53030] to-[#9B2C2C]',
        primary: '#C53030',
      },
      'indie-wanderer': {
        gradient: 'from-[#48BB78] via-[#38A169] to-[#2F855A]',
        primary: '#38A169',
      },
      'epic-adventurer': {
        gradient: 'from-[#4299E1] via-[#3182CE] to-[#2C5282]',
        primary: '#3182CE',
      },
      'comfort-curator': {
        gradient: 'from-[#D69E2E] via-[#B7791F] to-[#975A16]',
        primary: '#B7791F',
      },
      'mind-bender': {
        gradient: 'from-[#9F7AEA] via-[#805AD5] to-[#6B46C1]',
        primary: '#805AD5',
      },
      'classic-romantic': {
        gradient: 'from-[#ED64A6] via-[#D53F8C] to-[#B83280]',
        primary: '#D53F8C',
      },
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  radius: {
    button: '28px',
    card: '16px',
    image: '12px',
    modal: '24px',
  },

  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 4px 16px rgba(0,0,0,0.12)',
    lg: '0 8px 32px rgba(0,0,0,0.16)',
  },

  animations: {
    easing: {
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      micro: 150,
      standard: 350,
      screen: 700,
      story: 1400,
    },
  },
};

export const archetypeMap: Record<string, string> = {
  'The Escapist': 'midnight-cinephile',
  'The Analyzer': 'mind-bender',
  'The Heart Seeker': 'classic-romantic',
  'The Thrill Junkie': 'thriller-seeker',
  'The Social Butterfly': 'feel-good-explorer',
  'The Comfort Curator': 'comfort-curator',
  'The Genre Nomad': 'indie-wanderer',
  'The Philosopher': 'mind-bender',
};

export const getArchetypeColors = (archetypeName: string) => {
  const key = archetypeMap[archetypeName] || 'midnight-cinephile';
  return designSystem.colors.archetypes[key as keyof typeof designSystem.colors.archetypes];
};
