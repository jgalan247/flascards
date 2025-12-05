/**
 * Export flashcards to various formats (Kahoot, Quizlet)
 */

/**
 * Export to Quizlet format (tab-separated: question TAB answer)
 * Can be directly imported into Quizlet
 */
export function exportToQuizlet(cards, deckTitle) {
  const content = cards
    .map(card => `${card.question}\t${card.answer}`)
    .join('\n')

  downloadFile(content, `${sanitizeFilename(deckTitle)}_quizlet.txt`, 'text/plain')
}

/**
 * Export to Kahoot format (Excel-compatible CSV)
 * Kahoot requires: Question, Answer 1, Answer 2, Answer 3, Answer 4, Time limit, Correct answer(s)
 * For flashcards, we create simple quiz questions
 */
export function exportToKahoot(cards, deckTitle) {
  // Kahoot CSV header
  const header = 'Question,Answer 1,Answer 2,Answer 3,Answer 4,Time limit,Correct answer(s)'

  const rows = cards.map((card, index) => {
    // For flashcards, we put the correct answer as Answer 1
    // and generate placeholder wrong answers
    const question = escapeCSV(card.question)
    const correctAnswer = escapeCSV(card.answer)

    // Generate simple wrong answers (can be customized)
    const wrongAnswers = generateWrongAnswers(cards, index)

    return `${question},${correctAnswer},${wrongAnswers[0]},${wrongAnswers[1]},${wrongAnswers[2]},30,1`
  })

  const content = [header, ...rows].join('\n')
  downloadFile(content, `${sanitizeFilename(deckTitle)}_kahoot.csv`, 'text/csv')
}

/**
 * Export to Kahoot format without wrong answers (simpler format)
 * Teachers can add their own wrong answers in Kahoot
 */
export function exportToKahootSimple(cards, deckTitle) {
  const header = 'Question,Answer 1,Answer 2,Answer 3,Answer 4,Time limit,Correct answer(s)'

  const rows = cards.map(card => {
    const question = escapeCSV(card.question)
    const correctAnswer = escapeCSV(card.answer)

    return `${question},${correctAnswer},Add wrong answer,Add wrong answer,Add wrong answer,30,1`
  })

  const content = [header, ...rows].join('\n')
  downloadFile(content, `${sanitizeFilename(deckTitle)}_kahoot.csv`, 'text/csv')
}

/**
 * Export to Anki format (tab-separated text file)
 * Can be imported into Anki using File > Import
 * Format: question TAB answer (same as Quizlet but with .txt extension for Anki)
 */
export function exportToAnki(cards, deckTitle) {
  // Anki import format: front<tab>back
  // Adding a header comment for instructions
  const instructions = `# Anki Import Instructions:
# 1. Open Anki and go to File > Import
# 2. Select this file
# 3. Set "Field separator" to Tab
# 4. Set "Fields" to: Front, Back
# 5. Click Import
#
`
  const content = instructions + cards
    .map(card => `${card.question}\t${card.answer}`)
    .join('\n')

  downloadFile(content, `${sanitizeFilename(deckTitle)}_anki.txt`, 'text/plain')
}

/**
 * Export as JSON (for backup/transfer)
 */
export function exportToJSON(cards, deckTitle) {
  const content = JSON.stringify(cards, null, 2)
  downloadFile(content, `${sanitizeFilename(deckTitle)}.json`, 'application/json')
}

/**
 * Export as printable PDF-ready HTML
 */
export function exportToPrintable(cards, deckTitle) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${deckTitle} - Flashcards</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .card {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .question { font-weight: bold; color: #333; margin-bottom: 8px; }
    .answer { color: #666; padding-left: 15px; border-left: 3px solid #667eea; }
    .card-number { color: #999; font-size: 0.8em; }
    @media print {
      .card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${deckTitle}</h1>
  <p>${cards.length} flashcards</p>
  ${cards.map((card, i) => `
    <div class="card">
      <div class="card-number">Card ${i + 1}</div>
      <div class="question">Q: ${escapeHTML(card.question)}</div>
      <div class="answer">A: ${escapeHTML(card.answer)}</div>
    </div>
  `).join('')}
</body>
</html>
  `.trim()

  downloadFile(html, `${sanitizeFilename(deckTitle)}_printable.html`, 'text/html')
}

// Helper functions

function escapeCSV(str) {
  if (!str) return ''
  // If contains comma, newline, or quote, wrap in quotes and escape existing quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function escapeHTML(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

function generateWrongAnswers(cards, currentIndex) {
  // Get answers from other cards as wrong answers
  const otherAnswers = cards
    .filter((_, i) => i !== currentIndex)
    .map(c => escapeCSV(c.answer))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  // Pad with placeholders if not enough cards
  while (otherAnswers.length < 3) {
    otherAnswers.push('Add wrong answer')
  }

  return otherAnswers
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
