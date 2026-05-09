'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/store/authStore'
import { MaterialIcon } from '@/components/shared/MaterialIcon'

export function Navbar(): React.JSX.Element {
  const pathname = usePathname()
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const user = useAuthStore((state) => state.user)

  async function handleSignOut(): Promise<void> {
    try {
      await apiClient.post('/auth/sign-out')
    } catch {
      // Server unavailable — still clear client state and redirect
    }
    clearAuth()
    router.push('/')
  }

  const isAnalyzeActive = pathname === '/analyze'
  const isHistoryActive = pathname === '/history'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b-2 border-foreground/10 bg-white/90 px-4 backdrop-blur-md md:px-6" role="navigation" aria-label="Main navigation">
      <div className="flex items-center gap-6">
        <Link
          href="/analyze"
          className="flex items-center gap-2 text-lg font-heading font-semibold text-foreground transition-colors hover:text-primary"
          aria-label="CV Lint home"
        >
          <MaterialIcon icon="verified" className="text-primary" filled />
          CV Lint
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <Link
            href="/analyze"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              isAnalyzeActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            aria-current={isAnalyzeActive ? 'page' : undefined}
          >
            Analyze
          </Link>
          <Link
            href="/history"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              isHistoryActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            aria-current={isHistoryActive ? 'page' : undefined}
          >
            History
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <MaterialIcon icon="person" className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{user.name}</span>
          </div>
        )}

        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Sign out"
          >
            <MaterialIcon icon="logout" className="text-base" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        )}
      </div>
    </nav>
  )
}
