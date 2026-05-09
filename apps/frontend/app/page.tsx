import type { Metadata } from 'next'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: {
    template: '%s | CV Lint',
    default: 'CV Lint',
  },
  description:
    'Upload your CV and a job description. Get your ATS match score, see exactly which keywords are missing, and fix your resume with AI-powered rewrite suggestions in minutes.',
  openGraph: {
    title: 'CV Lint — Stop Guessing.',
    description:
      'See your ATS match score. Fix missing keywords. Land more interviews.',
    type: 'website',
  },
}

export default function RootPage() {
  return <LandingPage />
}
