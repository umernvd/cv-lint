import { CVData } from '../core/types'
import { SECTION_PATTERNS } from '../core/constants'

export class SectionParser {
  parse(text: string): CVData['sections'] {
    const lines = text.split('\n').map((line) => line.trim())
    const sections: CVData['sections'] = {}

    let currentSection: keyof CVData['sections'] | null = null
    let sectionText = ''

    for (const line of lines) {
      const detectedSection = this.identifySection(line)

      if (detectedSection) {
        if (currentSection && sectionText.trim()) {
          sections[currentSection] = sectionText.trim()
        }

        currentSection = detectedSection
        sectionText = ''
      } else if (currentSection) {
        sectionText += line + '\n'
      }
    }

    if (currentSection && sectionText.trim()) {
      sections[currentSection] = sectionText.trim()
    }

    return sections
  }

  identifySection(line: string): keyof CVData['sections'] | null {
    const trimmed = line.trim().toLowerCase()

    if (SECTION_PATTERNS.EXPERIENCE.test(trimmed)) return 'experience'
    if (SECTION_PATTERNS.EDUCATION.test(trimmed)) return 'education'
    if (SECTION_PATTERNS.SKILLS.test(trimmed)) return 'skills'
    if (SECTION_PATTERNS.SUMMARY.test(trimmed)) return 'summary'
    if (SECTION_PATTERNS.CERTIFICATIONS.test(trimmed)) return 'certifications'

    return null
  }

  getSectionText(sections: CVData['sections'], section: keyof CVData['sections']): string {
    return sections[section] || ''
  }

  hasSection(sections: CVData['sections'], section: keyof CVData['sections']): boolean {
    return !!sections[section] && sections[section]!.trim().length > 0
  }
}
