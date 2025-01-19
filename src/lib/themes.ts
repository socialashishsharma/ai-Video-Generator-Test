interface Theme {
  background: {
    gradient: {
      from: string;
      to: string;
    };
  };
  text: {
    title: string;
    body: string;
  };
  accent: string;
}

const themes: Theme[] = [
  {
    background: {
      gradient: {
        from: '#f0f9ff',
        to: '#ffffff'
      }
    },
    text: {
      title: '#1e3a8a',
      body: '#1e3a8a'
    },
    accent: '#3b82f6'
  },
  {
    background: {
      gradient: {
        from: '#fdf2f8',
        to: '#ffffff'
      }
    },
    text: {
      title: '#831843',
      body: '#831843'
    },
    accent: '#ec4899'
  },
  {
    background: {
      gradient: {
        from: '#f5f3ff',
        to: '#ffffff'
      }
    },
    text: {
      title: '#4c1d95',
      body: '#4c1d95'
    },
    accent: '#8b5cf6'
  },
  {
    background: {
      gradient: {
        from: '#ecfdf5',
        to: '#ffffff'
      }
    },
    text: {
      title: '#064e3b',
      body: '#064e3b'
    },
    accent: '#10b981'
  }
];

export function getRandomTheme(): Theme {
  return themes[Math.floor(Math.random() * themes.length)];
}