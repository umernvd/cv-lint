import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type JdTextInputProps = {
  value: string
  onChange: (value: string) => void
}

export default function JdTextInput({
  value,
  onChange,
}: JdTextInputProps): React.JSX.Element {
  const [isTouched, setIsTouched] = useState(false)
  const characterCount = value.length
  const isValid = characterCount >= 50
  const showError = isTouched && !isValid && characterCount > 0
  const counterColor = characterCount > 0 && characterCount < 50
    ? 'text-destructive'
    : 'text-muted-foreground'

  return (
    <div className="space-y-2">
      <label htmlFor="job-description" className="block text-sm font-bold uppercase tracking-wide text-foreground">
        Job Description
      </label>
      <Textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsTouched(true)}
        placeholder="Paste the full job description here…"
        maxLength={10000}
        className="min-h-[200px] resize-y"
        aria-describedby="jd-character-counter"
        aria-invalid={showError}
      />
      <div className="flex items-center justify-between min-h-[1.25rem]">
        {showError && (
          <p className="text-sm text-destructive">
            Job description must be at least 50 characters.
          </p>
        )}
        <p
          id="jd-character-counter"
          className={cn('ml-auto text-xs tabular-nums', counterColor)}
        >
          {characterCount}/10000
        </p>
      </div>
    </div>
  )
}
