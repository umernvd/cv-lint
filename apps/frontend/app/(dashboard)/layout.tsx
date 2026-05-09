import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { Navbar } from '@/components/layout/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <ErrorBoundary>
      <Navbar />
      <main id="main-content" className="pt-14">{children}</main>
    </ErrorBoundary>
  )
}
