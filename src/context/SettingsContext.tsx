import React, { createContext, useContext, useEffect, useState } from 'react';
import { Settings, Theme } from '../types';
import { DEFAULT_SETTINGS, THEMES, CLOAK_DATA } from '../constants';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('palmware_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const applySettings = (currentSettings: Settings) => {
    // Apply Theme
    let theme: Theme;
    if (currentSettings.theme === 'custom' && currentSettings.customColors) {
      theme = {
        name: 'Custom',
        ...currentSettings.customColors,
        overlay: 'rgba(0,0,0,0.5)',
        background: null
      };
    } else {
      theme = THEMES[currentSettings.theme] || THEMES.dark;
    }

    document.documentElement.style.setProperty('--primary-bg', theme.primary);
    document.documentElement.style.setProperty('--secondary-bg', theme.secondary);
    document.documentElement.style.setProperty('--accent-bg', theme.accent);
    document.documentElement.style.setProperty('--text-main', theme.text);
    document.documentElement.style.setProperty('--text-secondary', theme.textSecondary);

    // Apply Cloak
    const cloak = CLOAK_DATA[currentSettings.cloak] || CLOAK_DATA.none;
    document.title = cloak.title;
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = cloak.icon;

    // Apply Background
    const finalBg = currentSettings.background || theme.background;
    if (finalBg) {
      const overlay = theme.overlay || 'rgba(0,0,0,0.5)';
      document.body.style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url(${finalBg})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  };

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem('palmware_settings', JSON.stringify(settings));
  }, [settings]);

  // Panic Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === settings.panicKey) {
        window.location.href = settings.panicUrl;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.panicKey, settings.panicUrl]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('palmware_settings');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
