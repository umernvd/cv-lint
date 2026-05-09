import { ATS_CONFIG } from '../core/constants'

const STOP_WORDS = ATS_CONFIG.TEXT_PROCESSING.STOP_WORDS as readonly string[]

export class Tokenizer {
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        (token) =>
          token.length >= ATS_CONFIG.TEXT_PROCESSING.MIN_KEYWORD_LENGTH &&
          !STOP_WORDS.includes(token),
      )
  }

  tokenizeWithPunctuation(text: string): string[] {
    return text.match(/\b\w+\b/g) || []
  }

  tokenizePhrases(text: string, maxWords: number = 3): string[] {
    const tokens = this.tokenize(text)
    const phrases: string[] = []

    for (let n = 1; n <= maxWords; n++) {
      for (let i = 0; i <= tokens.length - n; i++) {
        phrases.push(tokens.slice(i, i + n).join(' '))
      }
    }

    return Array.from(new Set(phrases))
  }
}
