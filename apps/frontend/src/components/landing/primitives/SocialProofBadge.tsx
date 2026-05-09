import { Bolt } from 'lucide-react'

type SocialProofBadgeProps = {
  text: string
}

export default function SocialProofBadge({
  text,
}: SocialProofBadgeProps): React.JSX.Element {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-4 py-1.5">
      <Bolt className="h-4 w-4 text-primary" />
      <span className="text-xs font-medium text-foreground tracking-wide">
        {text}
      </span>
    </div>
  )
}
