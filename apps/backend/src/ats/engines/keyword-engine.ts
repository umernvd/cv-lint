import { KeywordMatch, KeywordImportance } from '../core/types'
import { ATS_CONFIG, TECH_SKILL_PATTERNS } from '../core/constants'
import { stringSimilarity } from '../nlp/similarity'
import { escapeRegex } from '../core/utils'

export class KeywordMatchEngine {
  private readonly cvText: string
  private readonly jdKeywords: string[]

  constructor(cvText: string, jdKeywords: string[]) {
    this.cvText = cvText.toLowerCase()
    this.jdKeywords = jdKeywords.map((k) => k.toLowerCase())
  }

  analyze(): {
    score: number
    matched: KeywordMatch[]
    missing: KeywordMatch[]
    partial: KeywordMatch[]
  } {
    const matched: KeywordMatch[] = []
    const missing: KeywordMatch[] = []
    const partial: KeywordMatch[] = []

    for (const keyword of this.jdKeywords) {
      const match = this.findKeyword(keyword)

      if (match.found) {
        if (match.similarity >= ATS_CONFIG.THRESHOLDS.EXACT_MATCH) {
          matched.push(match)
        } else if (match.similarity >= ATS_CONFIG.THRESHOLDS.PARTIAL_MATCH) {
          partial.push(match)
        } else {
          missing.push(match)
        }
      } else {
        missing.push(match)
      }
    }

    const score = this.calculateScore(matched, partial, missing)

    return { score, matched, missing, partial }
  }

  private findKeyword(keyword: string): KeywordMatch {
    const exactRegex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi')
    const exactMatches = this.cvText.match(exactRegex)

    if (exactMatches && exactMatches.length > 0) {
      return {
        keyword,
        found: true,
        frequency: exactMatches.length,
        context: this.extractContext(keyword),
        importance: this.determineImportance(keyword),
        similarity: 1.0,
      }
    }

    const fuzzyMatch = this.findFuzzyMatch(keyword)
    if (fuzzyMatch) {
      return {
        keyword,
        found: true,
        frequency: fuzzyMatch.frequency,
        context: this.extractContext(fuzzyMatch.term),
        importance: this.determineImportance(keyword),
        similarity: fuzzyMatch.similarity,
      }
    }

    const synonymMatch = this.findSynonymMatch(keyword)
    if (synonymMatch) {
      return {
        keyword,
        found: true,
        frequency: synonymMatch.frequency,
        context: this.extractContext(synonymMatch.term),
        importance: this.determineImportance(keyword),
        similarity: 0.9,
      }
    }

    return {
      keyword,
      found: false,
      frequency: 0,
      context: [],
      importance: this.determineImportance(keyword),
      similarity: 0,
    }
  }

  private findFuzzyMatch(
    keyword: string,
  ): { term: string; frequency: number; similarity: number } | null {
    const tokens = this.cvText.split(/\s+/)
    const candidates: { term: string; similarity: number }[] = []

    for (const token of tokens) {
      if (token.length < 3) continue

      const similarity = stringSimilarity(keyword, token)
      if (similarity >= ATS_CONFIG.THRESHOLDS.FUZZY_MATCH) {
        candidates.push({ term: token, similarity })
      }
    }

    if (candidates.length === 0) return null

    const best = candidates.reduce((a, b) =>
      a.similarity > b.similarity ? a : b,
    )
    const frequency = tokens.filter((t) => t === best.term).length

    return { ...best, frequency }
  }

  private findSynonymMatch(
    keyword: string,
  ): { term: string; frequency: number } | null {
    const normalizedKey = keyword.toLowerCase()
    const synonymsMap = ATS_CONFIG.TEXT_PROCESSING.COMMON_TECH_SYNONYMS as Record<string, readonly string[]>
    const synonyms = synonymsMap[normalizedKey] || []

    for (const synonym of synonyms) {
      const regex = new RegExp(`\\b${escapeRegex(synonym)}\\b`, 'gi')
      const matches = this.cvText.match(regex)

      if (matches) {
        return {
          term: synonym,
          frequency: matches.length,
        }
      }
    }

    return null
  }

  private extractContext(keyword: string, contextSize: number = 30): string[] {
    const regex = new RegExp(
      `.{0,${contextSize}}\\b${escapeRegex(keyword)}\\b.{0,${contextSize}}`,
      'gi',
    )
    const matches = this.cvText.match(regex)
    return matches ? matches.slice(0, 3) : []
  }

  private determineImportance(keyword: string): KeywordImportance {
    const lower = keyword.toLowerCase()

    if (ATS_CONFIG.TEXT_PROCESSING.COMMON_TECH_SYNONYMS[lower]) return 'critical'

    for (const pattern of TECH_SKILL_PATTERNS.slice(0, 4)) {
      if (pattern.test(lower)) return 'critical'
    }

    for (const pattern of TECH_SKILL_PATTERNS.slice(4, 8)) {
      if (pattern.test(lower)) return 'high'
    }

    for (const pattern of TECH_SKILL_PATTERNS.slice(8)) {
      if (pattern.test(lower)) return 'medium'
    }

    return 'low'
  }

  private calculateScore(
    matched: KeywordMatch[],
    partial: KeywordMatch[],
    missing: KeywordMatch[],
  ): number {
    let totalWeight = 0
    let earnedWeight = 0

    const allKeywords = [...matched, ...partial, ...missing]

    for (const kw of allKeywords) {
      const importance = ATS_CONFIG.KEYWORD_IMPORTANCE[kw.importance]
      totalWeight += importance

      if (matched.includes(kw)) {
        earnedWeight += importance
      } else if (partial.includes(kw)) {
        earnedWeight += importance * 0.7
      }
    }

    return totalWeight > 0
      ? Math.round((earnedWeight / totalWeight) * 100)
      : 0
  }
}
