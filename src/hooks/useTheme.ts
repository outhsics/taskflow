import { useState, useEffect } from 'react';
import { settingsRepository } from '@/repositories/SettingsRepository';

type Theme = 'light' | 'dark';

/**
 * Hook to manage app theme
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Load theme from settings
    async function loadTheme() {
      try {
        const settings = await settingsRepository.get();
        const savedTheme = settings?.theme ?? 'light';
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    }

    loadTheme();
  }, []);

  async function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    applyTheme(newTheme);

    // Save to settings
    try {
      await settingsRepository.update({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  return { theme, setTheme };
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
