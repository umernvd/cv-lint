export class Stemmer {
  stem(word: string): string {
    if (word.length < 4) return word

    let result = word.toLowerCase()

    result = this.removePlurals(result)
    result = this.removeVerbEndings(result)
    result = this.normalizeEndings(result)

    return result
  }

  stemTokens(tokens: string[]): string[] {
    return tokens.map((token) => this.stem(token))
  }

  private removePlurals(word: string): string {
    if (word.endsWith('sses')) return word.slice(0, -2)
    if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'i'
    if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1)
    return word
  }

  private removeVerbEndings(word: string): string {
    if (word.endsWith('eed') && word.length > 4) return word.slice(0, -1)

    if (word.endsWith('ed') && word.length > 4 && this.hasVowel(word.slice(0, -2))) {
      return this.normalizeAfterSuffix(word, 'ed')
    }

    if (word.endsWith('ing') && word.length > 5 && this.hasVowel(word.slice(0, -3))) {
      return this.normalizeAfterSuffix(word, 'ing')
    }

    return word
  }

  private normalizeEndings(word: string): string {
    if (word.endsWith('y') && !/[aeiou]y$/.test(word) && word.length > 3) {
      return word.slice(0, -1) + 'i'
    }
    return word
  }

  private normalizeAfterSuffix(word: string, suffix: string): string {
    let base = word.slice(0, -suffix.length)

    if (base.endsWith('at') || base.endsWith('bl') || base.endsWith('iz')) {
      return base + 'e'
    }

    if (/(.)(\1)$/.test(base) && !['ll', 'ss', 'zz'].includes(base.slice(-2))) {
      return base.slice(0, -1)
    }

    if (base.length >= 3 && !this.hasVowel(base) && !/[aeiouy][^aeiouy]$/.test(base)) {
      return base
    }

    return base
  }

  private hasVowel(word: string): boolean {
    return /[aeiouy]/.test(word)
  }
}
