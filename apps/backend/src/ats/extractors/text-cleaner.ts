import { ATS_CONFIG } from '../core/constants'
import { Tokenizer } from '../nlp/tokenizer'

export class TextCleaner {
  clean(text: string): string {
    return text
      .replace(/[\r\n]+/g, '\n')
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '')
      .replace(/\s*\n\s*/g, '\n')
      .trim()
  }

  normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  tokenize(text: string): string[] {
    const cleaned = this.normalize(text)
    const tokenizer = new Tokenizer()
    return tokenizer.tokenize(cleaned)
  }

  extractPhrases(text: string, maxWords: number = 3): string[] {
    const tokenizer = new Tokenizer()
    return tokenizer.tokenizePhrases(text, maxWords)
  }

  extractLines(text: string, limit: number = 20): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, limit)
  }

  extractBulletPoints(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(
        (line) =>
          /^[•\-*]\s+/.test(line) || /^\d+[\.)]\s+/.test(line),
      )
      .map((line) => line.replace(/^[•\-*\d+\.)]\s+/, '').trim())
      .filter((line) => line.length > 0)
  }
}
