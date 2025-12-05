/**
 * Parse AI-generated flashcards from various formats
 */

export function parseCards(text) {
  // Try JSON parsing first
  const jsonCards = tryParseJSON(text)
  if (jsonCards) return jsonCards

  // Try markdown table format
  const tableCards = tryParseTable(text)
  if (tableCards) return tableCards

  // Try numbered list format
  const listCards = tryParseList(text)
  if (listCards) return listCards

  // Try Q:/A: format
  const qaCards = tryParseQA(text)
  if (qaCards) return qaCards

  return null
}

function tryParseJSON(text) {
  try {
    // Find JSON array in text (might be wrapped in markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                      text.match(/\[[\s\S]*\]/)

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((card, index) => ({
          question: card.question || card.q || card.front || '',
          answer: card.answer || card.a || card.back || '',
          order: index,
        })).filter(card => card.question && card.answer)
      }
    }
  } catch (e) {
    // JSON parsing failed, try other formats
  }
  return null
}

function tryParseTable(text) {
  // Match markdown table format
  const tableRegex = /\|(.+?)\|(.+?)\|/g
  const matches = [...text.matchAll(tableRegex)]

  if (matches.length > 2) { // At least header + separator + 1 row
    const cards = []

    // Skip first two rows (header and separator)
    for (let i = 2; i < matches.length; i++) {
      const question = matches[i][1]?.trim()
      const answer = matches[i][2]?.trim()

      if (question && answer && !question.includes('---')) {
        cards.push({
          question,
          answer,
          order: cards.length,
        })
      }
    }

    if (cards.length > 0) return cards
  }
  return null
}

function tryParseList(text) {
  // Match numbered list with Q: A: format
  const listRegex = /(\d+)\.\s*(?:Q(?:uestion)?[:.]?\s*)?(.+?)(?:\n\s*A(?:nswer)?[:.]?\s*)(.+?)(?=\n\d+\.|$)/gis
  const matches = [...text.matchAll(listRegex)]

  if (matches.length > 0) {
    return matches.map((match, index) => ({
      question: match[2]?.trim(),
      answer: match[3]?.trim(),
      order: index,
    })).filter(card => card.question && card.answer)
  }
  return null
}

function tryParseQA(text) {
  // Match Q:/A: pairs
  const qaRegex = /Q(?:uestion)?[:.]?\s*(.+?)\s*A(?:nswer)?[:.]?\s*(.+?)(?=Q(?:uestion)?[:.]?|$)/gis
  const matches = [...text.matchAll(qaRegex)]

  if (matches.length > 0) {
    return matches.map((match, index) => ({
      question: match[1]?.trim(),
      answer: match[2]?.trim(),
      order: index,
    })).filter(card => card.question && card.answer)
  }
  return null
}

/**
 * Validate parsed cards
 */
export function validateCards(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return { valid: false, error: 'No cards found' }
  }

  const issues = []
  cards.forEach((card, index) => {
    if (!card.question?.trim()) {
      issues.push(`Card ${index + 1}: Missing question`)
    }
    if (!card.answer?.trim()) {
      issues.push(`Card ${index + 1}: Missing answer`)
    }
  })

  if (issues.length > 0) {
    return { valid: false, error: issues.join('; ') }
  }

  return { valid: true, cards }
}

/**
 * Fuzzy match for answer checking (Learn mode)
 */
export function fuzzyMatch(userAnswer, correctAnswer, threshold = 0.8) {
  const normalize = (str) =>
    str.toLowerCase()
       .replace(/[^\w\s]/g, '')
       .replace(/\s+/g, ' ')
       .trim()

  const userNorm = normalize(userAnswer)
  const correctNorm = normalize(correctAnswer)

  // Exact match
  if (userNorm === correctNorm) return { match: true, score: 1 }

  // Contains match (for short answers)
  if (correctNorm.length < 50 && userNorm.includes(correctNorm)) {
    return { match: true, score: 0.95 }
  }

  // Levenshtein distance for close matches
  const distance = levenshteinDistance(userNorm, correctNorm)
  const maxLen = Math.max(userNorm.length, correctNorm.length)
  const similarity = 1 - (distance / maxLen)

  return {
    match: similarity >= threshold,
    score: similarity,
  }
}

function levenshteinDistance(str1, str2) {
  const m = str1.length
  const n = str2.length
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}
