import type { FlowStep } from '@/components/landing/landing-content'

type AnalysisFlowStepProps = {
  step: FlowStep
}

type StepStyle = {
  containerClasses: string
  textClasses: string
}

const stepStyles: Record<string, StepStyle> = {
  highlighted: {
    containerClasses: 'bg-primary text-primary-foreground border-primary',
    textClasses: 'text-primary',
  },
  default: {
    containerClasses: 'bg-white text-foreground border-border',
    textClasses: 'text-foreground',
  },
}

export default function AnalysisFlowStep({
  step,
}: AnalysisFlowStepProps): React.JSX.Element {
  const style = step.isHighlighted ? stepStyles.highlighted : stepStyles.default

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold shadow-pop ${style.containerClasses}`}
      >
        <span className="relative">{step.step}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className={`text-sm font-semibold ${style.textClasses}`}>
          {step.label}
        </span>
        <span className="text-xs text-muted-foreground text-center">
          {step.sublabel}
        </span>
      </div>
    </div>
  )
}
