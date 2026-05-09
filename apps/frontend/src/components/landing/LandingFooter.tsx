import { FOOTER_CONTENT } from './landing-content'

export default function LandingFooter(): React.JSX.Element {
  return (
    <footer className="border-t-2 border-border bg-background w-full">
      <div className="max-w-7xl mx-auto px-4 py-xl flex flex-col items-center justify-center gap-4 text-center">
        <span className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {FOOTER_CONTENT.brand}. Made by Umer Naveed.
        </span>
      </div>
    </footer>
  )
}
