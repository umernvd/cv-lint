import type { Feature } from '@/components/landing/landing-content'

type FeatureCardProps = {
  feature: Feature
}

type AccentStyle = {
  containerClasses: string
  iconClasses: string
}

const accentStyles: Record<Feature['accentVariant'], AccentStyle> = {
  primary: {
    containerClasses: 'bg-primary/10',
    iconClasses: 'text-primary',
  },
  tertiary: {
    containerClasses: 'bg-tertiary/10',
    iconClasses: 'text-tertiary',
  },
  secondary: {
    containerClasses: 'bg-secondary/10',
    iconClasses: 'text-secondary',
  },
}

const rotationMap: Record<Feature['accentVariant'], string> = {
  primary: 'hover:-rotate-[1deg]',
  tertiary: 'hover:rotate-[1deg]',
  secondary: 'hover:-rotate-[0.5deg]',
}

export default function FeatureCard({
  feature,
}: FeatureCardProps): React.JSX.Element {
  const style = accentStyles[feature.accentVariant]
  const rotation = rotationMap[feature.accentVariant]

  return (
    <div className={`group rounded-xl border-2 border-foreground/15 bg-white p-xl shadow-sticker transition-all duration-300 ease-bounce hover:-translate-y-1 hover:shadow-sticker-pink ${rotation}`}>
      <div
        className={`inline-flex items-center justify-center rounded-lg p-3 mb-lg ${style.containerClasses}`}
      >
        <span
          className={`material-symbols-outlined text-2xl ${style.iconClasses}`}
        >
          {feature.icon}
        </span>
      </div>
      <h3 className="font-heading text-h3 text-foreground mb-sm">{feature.title}</h3>
      <p className="text-body text-muted-foreground">{feature.description}</p>
    </div>
  )
}
