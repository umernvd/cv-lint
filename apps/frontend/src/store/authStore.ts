import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type User = {
  id: string
  name: string
  email: string
}

type AuthState = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  clearAuth: () => void
  setHasHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      setHasHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated()
        }
      },
    },
  ),
)
