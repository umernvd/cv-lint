import Link from 'next/link'
import { NAV_LINKS, PRODUCT_NAME } from './landing-content'
import MobileNavDrawer from './MobileNavDrawer'

export default function LandingNav(): React.JSX.Element {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 border-b-2 border-border/20 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-foreground tracking-tighter font-heading"
        >
          {PRODUCT_NAME}
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 px-3 py-2 rounded-lg text-sm font-medium tracking-tight"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg text-sm font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-full shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0 active:translate-y-0 active:shadow-pop-active text-sm"
          >
            Get started free
          </Link>
          <MobileNavDrawer />
        </div>
      </div>
    </nav>
  )
}
