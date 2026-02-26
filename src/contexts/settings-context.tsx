'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserPreferences = {
  accentColor: string;
  logoUrl: string | null;
  groupName: string;
};

type SettingsContextType = {
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  loading: boolean;
};

const defaultPreferences: UserPreferences = {
  accentColor: 'emerald',
  logoUrl: null,
  groupName: 'DartsPro',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  // Load settings from API on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setPreferences({
              accentColor: data.user.accentColor || 'emerald',
              logoUrl: data.user.logoUrl || null,
              groupName: data.user.groupName || 'DartsPro',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  };

  return (
    <SettingsContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
