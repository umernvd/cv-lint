'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { NAV_LINKS } from './landing-content'

export default function MobileNavDrawer(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  function closeDrawer(): void {
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
      >
        <span className="material-symbols-outlined text-foreground">menu</span>
      </button>

      {isOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white border-l-2 border-border flex flex-col p-xl gap-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground tracking-tighter font-heading">
                Navigation
              </span>
              <button
                type="button"
                className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
              >
                <span className="material-symbols-outlined text-foreground">close</span>
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 px-3 py-2 rounded-lg text-sm font-medium tracking-tight"
                  onClick={closeDrawer}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <Link
                href="/sign-in"
                className="text-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium tracking-tight"
                onClick={closeDrawer}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-center bg-primary text-primary-foreground font-bold px-4 py-2 rounded-full shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0 active:translate-y-0 active:shadow-pop-active"
                onClick={closeDrawer}
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
