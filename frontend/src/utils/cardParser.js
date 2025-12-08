/**
 * Parse AI-generated flashcards from various formats
 * Returns { cards, format, repaired, warning } or null
 */

export function parseCards(text) {
  // Try JSON parsing first
  const jsonResult = tryParseJSON(text)
  if (jsonResult) return jsonResult

  // Try markdown table format
  const tableCards = tryParseTable(text)
  if (tableCards) return { cards: tableCards, format: 'table' }

  // Try numbered list format
  const listCards = tryParseList(text)
  if (listCards) return { cards: listCards, format: 'list' }

  // Try Q:/A: format
  const qaCards = tryParseQA(text)
  if (qaCards) return { cards: qaCards, format: 'qa' }

  return null
}

/**
 * Legacy function for backwards compatibility
 * Returns just the cards array or null
 */
export function parseCardsSimple(text) {
  const result = parseCards(text)
  return result ? result.cards : null
}

function tryParseJSON(text) {
  try {
    // Find JSON array in text (might be wrapped in markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                      text.match(/\[[\s\S]*\]/)

    if (jsonMatch) {
      let jsonStr = jsonMatch[1] || jsonMatch[0]
      const originalStr = jsonStr

      // Try to repair common JSON issues from incomplete copy/paste
      const repairResult = repairJSON(jsonStr)
      jsonStr = repairResult.json

      const parsed = JSON.parse(jsonStr)

      if (Array.isArray(parsed) && parsed.length > 0) {
        const cards = parsed.map((card, index) => ({
          question: card.question || card.q || card.front || '',
          answer: card.answer || card.a || card.back || '',
          order: index,
        })).filter(card => card.question && card.answer)

        return {
          cards,
          format: 'json',
          repaired: repairResult.repaired,
          warning: repairResult.warning,
          originalCount: parsed.length,
          validCount: cards.length
        }
      }
    }
  } catch (e) {
    // JSON parsing failed, try other formats
  }
  return null
}

/**
 * Attempt to repair common JSON issues from incomplete copy/paste
 * Returns { json, repaired, warning }
 */
function repairJSON(jsonStr) {
  let str = jsonStr.trim()
  let repaired = false
  let warning = null

  // Count brackets to detect truncation
  const openBrackets = (str.match(/\[/g) || []).length
  const closeBrackets = (str.match(/\]/g) || []).length
  const openBraces = (str.match(/\{/g) || []).length
  const closeBraces = (str.match(/\}/g) || []).length

  // If we have more opening than closing, the JSON was truncated
  if (openBrackets > closeBrackets || openBraces > closeBraces) {
    const result = repairTruncatedJSON(str)
    str = result.json
    repaired = result.repaired
    warning = result.warning
  }

  // Remove trailing commas before ] or }
  const beforeTrailingComma = str
  str = str.replace(/,(\s*[\]\}])/g, '$1')
  if (str !== beforeTrailingComma) {
    repaired = true
  }

  return { json: str, repaired, warning }
}

/**
 * Repair truncated JSON by finding the last complete object
 * Returns { json, repaired, warning }
 */
function repairTruncatedJSON(str) {
  // Find all complete objects in the array
  const objectRegex = /\{[^{}]*"question"\s*:\s*"[^"]*"[^{}]*"answer"\s*:\s*"[^"]*"[^{}]*\}/g
  const matches = str.match(objectRegex)

  if (matches && matches.length > 0) {
    // Count how many objects we expected vs found
    const expectedCount = (str.match(/\{\s*"/g) || []).length
    const foundCount = matches.length

    // Rebuild the JSON array with only complete objects
    const repairedJson = '[\n  ' + matches.join(',\n  ') + '\n]'

    let warning = null
    if (foundCount < expectedCount) {
      const lostCount = expectedCount - foundCount
      warning = `JSON was truncated. Recovered ${foundCount} complete cards (${lostCount} incomplete card${lostCount > 1 ? 's' : ''} removed). Please check if any cards are missing.`
    } else {
      warning = `JSON was repaired automatically. Please verify all cards are correct.`
    }

    return {
      json: repairedJson,
      repaired: true,
      warning
    }
  }

  // Alternative: Try to close the JSON properly
  let repaired = str
  let warning = null

  // If string ends mid-value, try to close it
  // Check if we're inside a string (odd number of unescaped quotes)
  const quoteCount = (str.match(/(?<!\\)"/g) || []).length
  if (quoteCount % 2 !== 0) {
    // We're inside a string, close it
    repaired += '"'
  }

  // Close any unclosed braces/brackets
  const openBraces = (repaired.match(/\{/g) || []).length
  const closeBraces = (repaired.match(/\}/g) || []).length
  const openBrackets = (repaired.match(/\[/g) || []).length
  const closeBrackets = (repaired.match(/\]/g) || []).length

  const missingBraces = openBraces - closeBraces
  const missingBrackets = openBrackets - closeBrackets

  // Add missing closing braces
  for (let i = 0; i < missingBraces; i++) {
    repaired += '}'
  }

  // Add missing closing brackets
  for (let i = 0; i < missingBrackets; i++) {
    repaired += ']'
  }

  if (missingBraces > 0 || missingBrackets > 0) {
    warning = `JSON was incomplete (missing ${missingBrackets > 0 ? `${missingBrackets} ']'` : ''}${missingBraces > 0 && missingBrackets > 0 ? ' and ' : ''}${missingBraces > 0 ? `${missingBraces} '}'` : ''}). Auto-repaired, please verify all cards.`
  }

  return { json: repaired, repaired: missingBraces > 0 || missingBrackets > 0, warning }
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
