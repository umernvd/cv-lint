import { Recommendation, KeywordMatch } from '../core/types'

export class RecommendationGenerator {
  generate(
    missingKeywords: KeywordMatch[],
    partialKeywords: KeywordMatch[],
    allInsights: string[],
    currentScore: number,
  ): Recommendation[] {
    const recommendations: Recommendation[] = []

    const criticalMissing = missingKeywords
      .filter((kw) => kw.importance === 'critical')
      .slice(0, 5)

    for (const kw of criticalMissing) {
      recommendations.push({
        type: 'critical',
        category: 'keyword',
        title: `Add critical skill: ${kw.keyword}`,
        description: `This is a must-have skill for the role. Include it in your skills section and demonstrate usage in your experience.`,
        impact: 8,
        actionable: true,
        suggestion: `Example: "Developed production applications using ${kw.keyword}"`,
      })
    }

    const highMissing = missingKeywords
      .filter((kw) => kw.importance === 'high')
      .slice(0, 3)

    for (const kw of highMissing) {
      recommendations.push({
        type: 'important',
        category: 'keyword',
        title: `Include important skill: ${kw.keyword}`,
        description: `This skill is highly valued for the role. If you have experience with it, make sure to mention it.`,
        impact: 5,
        actionable: true,
        suggestion: `Add "${kw.keyword}" to your skills section and describe relevant experience`,
      })
    }

    for (const kw of partialKeywords.slice(0, 3)) {
      recommendations.push({
        type: 'suggested',
        category: 'keyword',
        title: `Strengthen "${kw.keyword}" mentions`,
        description: `You mention this skill, but could emphasize it more to match the job requirements.`,
        impact: 3,
        actionable: true,
        suggestion: `Add more context about your ${kw.keyword} experience in your work history`,
      })
    }

    for (const insight of allInsights.slice(0, 5)) {
      const category = this.categorizeInsight(insight)
      recommendations.push({
        type: 'suggested',
        category,
        title: insight,
        description: this.expandInsight(insight),
        impact: 2,
        actionable: true,
      })
    }

    if (currentScore < 60) {
      recommendations.unshift({
        type: 'critical',
        category: 'content',
        title: 'Significant alignment needed',
        description:
          'Your CV needs substantial updates to match this job description. Focus on adding relevant keywords and tailoring your experience descriptions.',
        impact: 15,
        actionable: true,
        suggestion: 'Rewrite your professional summary to highlight skills matching this role',
      })
    } else if (currentScore < 75) {
      recommendations.push({
        type: 'important',
        category: 'content',
        title: 'Good foundation, needs refinement',
        description:
          'Your CV shows relevant experience. Fine-tune keyword usage and add more specific examples.',
        impact: 10,
        actionable: true,
      })
    } else if (currentScore >= 90) {
      recommendations.push({
        type: 'suggested',
        category: 'content',
        title: 'Excellent match!',
        description:
          'Your CV is well-aligned with the job requirements. Minor optimizations could make it even stronger.',
        impact: 2,
        actionable: false,
      })
    }

    return recommendations.sort((a, b) => b.impact - a.impact)
  }

  private categorizeInsight(insight: string): Recommendation['category'] {
    const lower = insight.toLowerCase()

    if (lower.includes('experience')) return 'experience'
    if (lower.includes('education') || lower.includes('degree') || lower.includes('certification')) return 'education'
    if (lower.includes('skill')) return 'keyword'
    if (lower.includes('section') || lower.includes('format') || lower.includes('contact') || lower.includes('date') || lower.includes('metric') || lower.includes('verb') || lower.includes('page')) return 'format'

    return 'content'
  }

  private expandInsight(insight: string): string {
    const expansions: Record<string, string> = {
      'add missing sections': 'A complete CV with all standard sections (Experience, Education, Skills) scores higher in ATS systems.',
      'career growth': 'Showing progression in your career (promotions, increasing responsibilities) demonstrates value to employers.',
      'action verbs': 'Starting bullet points with strong action verbs (Developed, Led, Achieved) makes your accomplishments more impactful.',
      'quantifiable': 'Adding specific numbers and metrics (e.g., "increased revenue by 30%") helps recruiters understand your impact.',
      'contact information': 'ATS systems need clear contact details to reach you. Ensure email and phone are prominently placed.',
      'too brief': 'A CV with fewer than 300 words likely lacks sufficient detail for ATS systems to assess your qualifications.',
      'lengthy': 'Focus on the most relevant experiences. Recruiters typically spend 6-8 seconds on initial CV screening.',
      'certifications': 'Industry-recognized certifications demonstrate validated expertise and can significantly boost your score.',
    }

    const lower = insight.toLowerCase()
    for (const [key, expansion] of Object.entries(expansions)) {
      if (lower.includes(key)) {
        return expansion
      }
    }

    return insight
  }
}
