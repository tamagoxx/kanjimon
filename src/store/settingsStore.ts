import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';
export type Language = 'id' | 'en' | 'jp';

interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
  dailyReminder: boolean;
  battleReminder: boolean;
}

interface SettingsState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Notifications
  notifications: NotificationSettings;
  setNotification: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void;

  // Helpers
  isDark: () => boolean;
  getLanguageLabel: () => string;
  getThemeLabel: () => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'id',
      notifications: {
        pushEnabled: true,
        soundEnabled: true,
        dailyReminder: true,
        battleReminder: false,
      },

      setTheme: (theme) => {
        set({ theme });
        // Apply to document
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
          document.documentElement.style.setProperty('--bg-primary', '#0a1519');
          document.documentElement.style.setProperty('--bg-card', '#1a1a2e');
        } else {
          document.documentElement.style.setProperty('--bg-primary', '#f5f5f5');
          document.documentElement.style.setProperty('--bg-card', '#ffffff');
        }
      },

      setLanguage: (language) => set({ language }),

      setNotification: (key, value) => {
        set(state => ({
          notifications: { ...state.notifications, [key]: value },
        }));
      },

      isDark: () => get().theme === 'dark',

      getLanguageLabel: () => {
        const labels: Record<Language, string> = {
          id: 'Indonesia',
          en: 'English',
          jp: '日本語',
        };
        return labels[get().language];
      },

      getThemeLabel: () => {
        return get().theme === 'dark' ? 'Gelap' : 'Terang';
      },
    }),
    {
      name: 'kanjimon-settings',
    }
  )
);