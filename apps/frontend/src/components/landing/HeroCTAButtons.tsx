'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HERO_CONTENT } from './landing-content'

export default function HeroCTAButtons(): React.JSX.Element {
  const router = useRouter()

  function scrollToHowItWorks(): void {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Link
        href="/sign-up"
        className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0 active:translate-y-0 active:shadow-pop-active text-center min-w-64"
      >
        {HERO_CONTENT.primaryCta}
      </Link>
      <button
        type="button"
        onClick={scrollToHowItWorks}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground border-2 border-border/30 hover:border-foreground/20 px-6 py-3 rounded-full transition-all min-w-48 justify-center"
      >
        <span className="material-symbols-outlined text-xl">play_circle</span>
        <span className="text-sm font-medium">{HERO_CONTENT.secondaryCta}</span>
      </button>
    </div>
  )
}
