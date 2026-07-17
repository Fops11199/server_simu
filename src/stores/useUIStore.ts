import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type ActiveProvider = 'none' | 'cpanel' | 'contabo' | 'aws' | 'digitalocean' | 'hostinger';

interface UIStore {
  theme: Theme;
  activeProvider: ActiveProvider;
  sidebarOpen: boolean;
  companionOpen: boolean;
  fullScreen: boolean;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setActiveProvider: (provider: ActiveProvider) => void;
  toggleSidebar: () => void;
  toggleCompanion: () => void;
  setCompanionOpen: (open: boolean) => void;
  toggleFullScreen: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      activeProvider: 'none',
      sidebarOpen: false,
      companionOpen: false,
      fullScreen: false,

      toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      setActiveProvider: (activeProvider) => set({ activeProvider }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      toggleCompanion: () => set(s => ({ companionOpen: !s.companionOpen })),
      setCompanionOpen: (companionOpen) => set({ companionOpen }),
      toggleFullScreen: () => set(s => ({ fullScreen: !s.fullScreen })),
    }),
    {
      name: 'hostlab-ui-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
