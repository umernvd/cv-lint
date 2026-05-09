import SocialProofBadge from './primitives/SocialProofBadge'
import HeroCTAButtons from './HeroCTAButtons'
import { HERO_CONTENT } from './landing-content'

export default function HeroSection(): React.JSX.Element {
  return (
    <div className="relative w-full max-w-6xl px-margin flex flex-col items-center text-center mt-3xl mb-3xl gap-xl">
      <SocialProofBadge text={HERO_CONTENT.badge} />
      <h1 className="relative z-10 font-heading text-display text-foreground max-w-4xl tracking-tighter">
        {HERO_CONTENT.headline}
      </h1>
      <p className="relative z-10 text-h3 text-muted-foreground max-w-2xl font-normal">
        {HERO_CONTENT.subheading}
      </p>
      <HeroCTAButtons />
    </div>
  )
}
