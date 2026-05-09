export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length
}

export function extractYears(text: string): number {
  const datePattern = /(\d{4})\s*[-\u2013\u2014]\s*(\d{4}|present|current)/gi
  const matches = [...text.matchAll(datePattern)]

  let totalYears = 0
  for (const match of matches) {
    const startYear = parseInt(match[1], 10)
    const endYear = /present|current/i.test(match[2])
      ? new Date().getFullYear()
      : parseInt(match[2], 10)

    if (!Number.isNaN(startYear) && !Number.isNaN(endYear)) {
      totalYears += endYear - startYear
    }
  }

  return totalYears
}

export function extractYearRange(text: string): { years: number; matches: string[] } {
  const datePattern = /\b(\d{4})\s*[-\u2013\u2014]\s*(\d{4}|present|current)\b/gi
  const matches = [...text.matchAll(datePattern)]

  let totalYears = 0
  const matchStrings: string[] = []

  for (const match of matches) {
    matchStrings.push(match[0])
    const startYear = parseInt(match[1], 10)
    const endYear = /present|current/i.test(match[2])
      ? new Date().getFullYear()
      : parseInt(match[2], 10)

    if (!Number.isNaN(startYear) && !Number.isNaN(endYear)) {
      totalYears += endYear - startYear
    }
  }

  return { years: totalYears, matches: matchStrings }
}

export function hasEmail(text: string): boolean {
  return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text)
}

export function hasPhone(text: string): boolean {
  return /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text) || /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/.test(text)
}

export function hasDates(text: string): boolean {
  return /\b(19|20)\d{2}\b/.test(text)
}

export function hasQuantifiableAchievements(text: string): boolean {
  return /\b\d+%|\$\d[\d,]*|\b\d+\s*(million|billion|thousand|k|m)\b/i.test(text)
}

export function hasActionVerbs(text: string): boolean {
  const actionVerbs = [
    'achieved', 'developed', 'implemented', 'led', 'managed',
    'created', 'designed', 'improved', 'increased', 'reduced',
    'built', 'launched', 'delivered', 'optimized', 'streamlined',
    'engineered', 'architected', 'deployed', 'scaled', 'automated',
    'spearheaded', 'orchestrated', 'transformed', 'accelerated',
  ]

  const lower = text.toLowerCase()
  return actionVerbs.some((verb) => lower.includes(verb))
}

export function detectSeniorityLevel(text: string): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
  const lower = text.toLowerCase()

  if (/\b(cto|ceo|vp|vice president|director|head\s+of|chief)\b/.test(lower)) {
    return 'executive'
  }
  if (/\b(lead|principal|staff|architect|manager)\b/.test(lower)) {
    return 'lead'
  }
  if (/\b(senior|sr\.?)\b/.test(lower)) {
    return 'senior'
  }
  if (/\b(junior|jr\.?|entry|intern|graduate|associate)\b/.test(lower)) {
    return 'entry'
  }

  return 'mid'
}

export function hasCareerProgression(text: string): boolean {
  const patterns = [
    /promoted\s+to/i,
    /advanced\s+to/i,
    /progression\s+from/i,
    /junior.*senior/i,
    /associate.*lead/i,
    /intern.*full.?time/i,
    /analyst.*manager/i,
    /developer.*senior/i,
    /engineer.*lead/i,
  ]

  return patterns.some((pattern) => pattern.test(text))
}

export function hasCertifications(text: string): boolean {
  const patterns = [
    /\b(certified|certification|certificate|credential)\b/i,
    /\b(aws|azure|gcp|pmp|cissp|cpa|ccna|rhce|comptia)\b/i,
  ]

  return patterns.some((pattern) => pattern.test(text))
}

export function hasDegree(text: string): boolean {
  return /\b(bachelor|master|phd|doctorate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?eng|m\.?eng|diploma|degree)\b/i.test(text)
}

export function sha256Hash(text: string): string {
  const crypto = require('crypto') as typeof import('crypto')
  return crypto.createHash('sha256').update(text).digest('hex')
}
