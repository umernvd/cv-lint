export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
] as const

export const HERO_CONTENT = {
  badge: 'Helping 500+ students land interviews',
  headline: "Stop guessing. Know exactly why you're getting rejected.",
  subheading: 'Your CV vs the job description. See the gap. Fix it in minutes.',
  primaryCta: "Analyze my CV — it's free",
  secondaryCta: 'See how it works',
} as const

export const MOCKUP_SCORE = 68

export const MOCKUP_SCORE_LABEL = 'Needs Improvement'

export type KeywordStatus = 'matched' | 'missing' | 'weak'

export type MockupKeyword = {
  keyword: string
  status: KeywordStatus
  label: string
}

export const MOCKUP_KEYWORDS: MockupKeyword[] = [
  { keyword: 'Kubernetes', status: 'missing', label: 'Missing Critical Skill' },
  { keyword: 'CI/CD Pipelines', status: 'weak', label: 'Mentioned Weakly' },
  { keyword: 'Python', status: 'matched', label: 'Strong Match' },
]

export type Feature = {
  icon: string
  title: string
  description: string
  accentVariant: 'primary' | 'tertiary' | 'secondary'
}

export const FEATURES: Feature[] = [
  {
    icon: 'speed',
    title: 'Instant ATS Score',
    description:
      'See exactly how standard Applicant Tracking Systems rank your resume against the job description in milliseconds.',
    accentVariant: 'primary',
  },
  {
    icon: 'find_in_page',
    title: 'Keyword Gap Analysis',
    description:
      'Identify critical missing skills and terminology that the job description demands but your CV lacks.',
    accentVariant: 'tertiary',
  },
  {
    icon: 'auto_fix_high',
    title: 'AI Rewrite Suggestions',
    description:
      'Get actionable, context-aware suggestions to rephrase your experience and highlight your strongest matches.',
    accentVariant: 'secondary',
  },
]

export type FlowStep = {
  step: number
  label: string
  sublabel: string
  isHighlighted: boolean
}

export const FLOW_STEPS: FlowStep[] = [
  { step: 1, label: 'Upload', sublabel: 'Your current CV', isHighlighted: false },
  { step: 2, label: 'Paste', sublabel: 'Target Job Description', isHighlighted: false },
  { step: 3, label: 'Score', sublabel: 'Instant AI Analysis', isHighlighted: true },
  { step: 4, label: 'Edit', sublabel: 'Review Keyword Gaps', isHighlighted: false },
  { step: 5, label: 'Improve', sublabel: 'Apply AI Rewrites', isHighlighted: false },
]

export const TESTIMONIAL = {
  quote:
    'CV Lint completely changed how I apply. Seeing exactly what the ATS was filtering out allowed me to tailor my resume instantly.',
  name: 'Sara K.',
  result: 'FAST-NUML → Landed Cloud Engineer Internship at Systems Ltd',
} as const

export const FOOTER_CONTENT = {
  brand: 'CV Lint',
} as const

export const PRODUCT_NAME = 'CV Lint'
