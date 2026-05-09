import FeatureCard from './primitives/FeatureCard'
import { FEATURES } from './landing-content'

export default function FeaturesSection(): React.JSX.Element {
  return (
    <section className="w-full max-w-5xl px-margin mt-3xl mb-3xl">
      <h2 className="font-heading text-h1 text-foreground text-center mb-3xl">
        Engineered for Precision
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  )
}
