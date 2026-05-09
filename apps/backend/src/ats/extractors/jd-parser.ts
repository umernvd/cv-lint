import { JobDescription } from '../core/types'
import { TextCleaner } from './text-cleaner'
import {
  TECH_SKILL_PATTERNS,
  SOFT_SKILL_PATTERNS,
} from '../core/constants'

export class JobDescriptionParser {
  parse(rawText: string): JobDescription {
    const cleaned = new TextCleaner().clean(rawText)

    return {
      rawText,
      parsed: {
        title: this.extractTitle(cleaned),
        requirements: this.extractRequirements(cleaned),
        skills: this.extractSkills(cleaned),
        experience: this.extractExperience(cleaned),
        education: this.extractEducation(cleaned),
      },
    }
  }

  private extractTitle(text: string): string | undefined {
    const lines = text.split('\n').slice(0, 10)

    const titlePatterns = [
      /(?:position|role|job title|hiring for)[:\s]+(.+)/i,
      /^(.+?)\s*(?:position|role|job)/i,
    ]

    for (const line of lines) {
      for (const pattern of titlePatterns) {
        const match = line.match(pattern)
        if (match) return match[1].trim()
      }
    }

    return undefined
  }

  private extractRequirements(text: string): JobDescription['parsed']['requirements'] {
    const required: string[] = []
    const preferred: string[] = []

    const reqSection = this.findSection(text, [
      'requirements',
      'required qualifications',
      'must have',
      'essential qualifications',
      'what you will need',
    ])

    const prefSection = this.findSection(text, [
      'preferred',
      'nice to have',
      'bonus qualifications',
      'plus',
      'good to have',
    ])

    if (reqSection) {
      const bullets = new TextCleaner().extractBulletPoints(reqSection)
      required.push(...bullets)

      if (bullets.length === 0) {
        const sentences = reqSection
          .split(/[.!\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 10)
        required.push(...sentences)
      }
    }

    if (prefSection) {
      preferred.push(...new TextCleaner().extractBulletPoints(prefSection))
    }

    return { required, preferred }
  }

  private extractSkills(text: string): JobDescription['parsed']['skills'] {
    const technical: string[] = []
    const soft: string[] = []

    for (const pattern of TECH_SKILL_PATTERNS) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        technical.push(match[0].toLowerCase())
      }
    }

    for (const pattern of SOFT_SKILL_PATTERNS) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        soft.push(match[0].toLowerCase())
      }
    }

    return {
      technical: Array.from(new Set(technical)),
      soft: Array.from(new Set(soft)),
    }
  }

  private extractExperience(
    text: string,
  ): JobDescription['parsed']['experience'] {
    const yearsPattern = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?experience/i
    const match = text.match(yearsPattern)
    const years = match ? parseInt(match[1], 10) : undefined

    let level: JobDescription['parsed']['experience']['level'] = 'mid'

    if (/\b(entry.level|junior|graduate|intern)\b/i.test(text)) {
      level = 'entry'
    } else if (/\b(senior|sr\.?|lead|principal)\b/i.test(text)) {
      level = 'senior'
    } else if (/\b(staff|architect|director|vp|head\s+of)\b/i.test(text)) {
      level = 'lead'
    } else if (/\b(cto|ceo|executive|c.level|vice\s+president)\b/i.test(text)) {
      level = 'executive'
    }

    return { years, level }
  }

  private extractEducation(text: string): JobDescription['parsed']['education'] {
    const degreeMatch = text.match(
      /\b(bachelor|master|phd|doctorate|degree|bs|ms|ba|ma|b\.?s\.?|m\.?s\.?|b\.?eng)\b/i,
    )
    const fieldMatch = text.match(
      /\b(computer\s+science|engineering|mathematics|cs|information\s+technology|software\s+engineering)\b/i,
    )

    const degree = degreeMatch?.[0]
    const field = fieldMatch?.[0]

    const required =
      /\b(required|must\s+have|essential|mandatory)\b.*\b(degree|education|bachelor|master)\b/i.test(
        text,
      ) ||
      /\b(bachelor|master)\b.*\b(required|mandatory|essential)\b/i.test(text)

    return { degree, field, required }
  }

  private findSection(text: string, headers: string[]): string | null {
    const lines = text.split('\n')
    let sectionStart = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (headers.some((header) => line.includes(header))) {
        sectionStart = i
        break
      }
    }

    if (sectionStart === -1) return null

    let sectionEnd = lines.length
    for (let i = sectionStart + 1; i < lines.length; i++) {
      if (lines[i].match(/^[A-Z\s]+:/) || lines[i].match(/^#{1,3}\s/)) {
        sectionEnd = i
        break
      }
    }

    return lines.slice(sectionStart, sectionEnd).join('\n')
  }
}
