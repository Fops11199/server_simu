import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  xp: number;
}

interface AuthState {
  user: User | null;
  sessionId: string | null;
  isLoggedIn: boolean;

  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateXp: (xp: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionId: null,
      isLoggedIn: false,

      login: async (username, pin) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, pin }),
          });

          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.error || 'Login failed' };
          }

          set({
            user: data.user,
            sessionId: data.sessionId,
            isLoggedIn: true,
          });

          return { success: true };
        } catch (err: any) {
          console.error('Login request failed', err);
          return { success: false, error: 'Could not connect to database server' };
        }
      },

      register: async (username, pin) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, pin }),
          });

          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.error || 'Registration failed' };
          }

          set({
            user: data.user,
            sessionId: data.sessionId,
            isLoggedIn: true,
          });

          return { success: true };
        } catch (err: any) {
          console.error('Registration request failed', err);
          return { success: false, error: 'Could not connect to database server' };
        }
      },

      logout: async () => {
        const { sessionId } = get();
        if (sessionId) {
          try {
            await fetch(`/api/auth/sessions/${sessionId}/end`, { method: 'POST' });
          } catch (err) {
            console.error('Failed to end session on server', err);
          }
        }
        set({ user: null, sessionId: null, isLoggedIn: false });
      },

      updateXp: async (xp) => {
        const { user } = get();
        if (!user) return;

        try {
          const res = await fetch(`/api/users/${user.id}/xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp }),
          });

          if (res.ok) {
            set((state) => ({
              user: state.user ? { ...state.user, xp } : null,
            }));
          }
        } catch (err) {
          console.error('Failed to sync XP with server', err);
        }
      },
    }),
    {
      name: 'hostlab-auth-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
