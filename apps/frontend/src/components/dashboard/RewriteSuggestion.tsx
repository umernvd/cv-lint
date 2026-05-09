import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { RewriteSuggestion } from '@/types/analysis'

type RewriteSuggestionProps = {
  suggestion: RewriteSuggestion
  isAccepted: boolean
  onAccept: () => void
  onSkip: () => void
}

export default function RewriteSuggestion({
  suggestion,
  isAccepted,
  onAccept,
  onSkip,
}: RewriteSuggestionProps): React.JSX.Element {
  const shouldReduce = useReducedMotion()
  const motionTransition = shouldReduce ? { duration: 0 } : { duration: 0.2 }

  return (
    <div
      role="article"
      className={`rounded-xl border-2 bg-white p-6 shadow-sticker transition-all duration-300 ease-bounce hover:-rotate-[0.3deg] hover:scale-[1.01] ${
        isAccepted ? 'border-success/30 bg-success/5' : 'border-foreground/15'
      }`}
    >
      <AnimatePresence mode="wait">
        {isAccepted ? (
          <motion.div
            key="accepted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={motionTransition}
            className="flex items-center gap-2 text-success"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Applied</span>
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="mb-2 text-sm text-foreground">{suggestion.text}</p>
            <p className="mb-4 text-sm text-muted-foreground">
              {suggestion.explanation}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onAccept}
                className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0 active:translate-y-0 active:shadow-pop-active"
                aria-label={`Accept suggestion: ${suggestion.text.slice(0, 50)}`}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="rounded-full border-2 border-foreground/30 px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-tertiary/20"
                aria-label="Skip this suggestion"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
