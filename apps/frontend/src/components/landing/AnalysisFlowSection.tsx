import AnalysisFlowStep from './primitives/AnalysisFlowStep'
import { FLOW_STEPS } from './landing-content'

export default function AnalysisFlowSection(): React.JSX.Element {
  return (
    <section className="w-full max-w-5xl px-margin mt-3xl mb-3xl">
      <h2 className="font-heading text-h1 text-foreground text-center mb-3xl">
        The Analysis Flow
      </h2>
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-xl md:gap-lg">
        <div className="hidden md:block absolute top-6 left-6 right-6 h-[2px] bg-border/40 -z-10" />
        {FLOW_STEPS.map((step) => (
          <AnalysisFlowStep key={step.step} step={step} />
        ))}
      </div>
    </section>
  )
}
