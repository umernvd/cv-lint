import { Tokenizer } from './tokenizer'

export function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

export function levenshteinDistance(str1: string, str2: string): number {
  const rows = str2.length + 1
  const cols = str1.length + 1

  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0),
  )

  for (let i = 0; i < rows; i++) {
    matrix[i][0] = i
  }

  for (let j = 0; j < cols; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }

  return matrix[rows - 1][cols - 1]
}

export function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>,
): number {
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  const allKeys = new Set([...vec1.keys(), ...vec2.keys()])

  for (const key of allKeys) {
    const val1 = vec1.get(key) || 0
    const val2 = vec2.get(key) || 0

    dotProduct += val1 * val2
    magnitude1 += val1 * val1
    magnitude2 += val2 * val2
  }

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  if (magnitude1 === 0 || magnitude2 === 0) return 0

  return dotProduct / (magnitude1 * magnitude2)
}

export function createTFIDFVector(text: string): Map<string, number> {
  const tokenizer = new Tokenizer()
  const tokens = tokenizer.tokenize(text)

  const tf = new Map<string, number>()
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1)
  }

  const totalTokens = tokens.length
  if (totalTokens === 0) return tf

  for (const [term, count] of tf.entries()) {
    tf.set(term, count / totalTokens)
  }

  return tf
}

export function createMultiTFIDFVector(texts: string[]): Map<string, Map<string, number>> {
  const vectors = texts.map((text) => createTFIDFVector(text))

  const corpusTF: Map<string, number> = new Map()
  for (const vector of vectors) {
    for (const term of vector.keys()) {
      corpusTF.set(term, (corpusTF.get(term) || 0) + 1)
    }
  }

  const totalDocs = texts.length
  const idf = new Map<string, number>()
  for (const [term, docCount] of corpusTF.entries()) {
    idf.set(term, Math.log((totalDocs + 1) / (docCount + 1)) + 1)
  }

  const tfidfVectors = new Map<string, Map<string, number>>()
  for (let i = 0; i < vectors.length; i++) {
    const tfidf = new Map<string, number>()
    for (const [term, tf] of vectors[i].entries()) {
      const idfValue = idf.get(term) || 1
      tfidf.set(term, tf * idfValue)
    }
    tfidfVectors.set(`doc_${i}`, tfidf)
  }

  return tfidfVectors
}
