import { ATSAnalysisResult } from '../core/types'

interface CacheEntry {
  result: ATSAnalysisResult
  timestamp: number
}

const CACHE_MAX = 100
const CACHE_TTL = 60 * 60 * 1000

export class AnalysisCache {
  private readonly entries = new Map<string, CacheEntry>()
  private readonly order: string[] = []

  get(key: string): ATSAnalysisResult | undefined {
    const entry = this.entries.get(key)

    if (!entry) return undefined

    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.entries.delete(key)
      const idx = this.order.indexOf(key)
      if (idx !== -1) this.order.splice(idx, 1)
      return undefined
    }

    this.touch(key)
    return entry.result
  }

  set(key: string, result: ATSAnalysisResult): void {
    if (this.entries.size >= CACHE_MAX) {
      const oldest = this.order.shift()
      if (oldest) this.entries.delete(oldest)
    }

    this.entries.set(key, { result, timestamp: Date.now() })
    this.order.push(key)
  }

  has(key: string): boolean {
    return !!this.get(key)
  }

  clear(): void {
    this.entries.clear()
    this.order.length = 0
  }

  get size(): number {
    return this.entries.size
  }

  private touch(key: string): void {
    const idx = this.order.indexOf(key)
    if (idx !== -1) {
      this.order.splice(idx, 1)
      this.order.push(key)
    }
  }
}
