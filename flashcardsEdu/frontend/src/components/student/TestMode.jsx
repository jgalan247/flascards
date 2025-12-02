import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import './TestMode.css'

function TestMode() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [results, setResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeck()
  }, [slug])

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/study/${slug}/`)
      setDeck(response.data)
      generateQuestions(response.data.cards || [])
    } catch (error) {
      console.error('Error fetching deck:', error)
      navigate(`/study/${slug}`)
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = (cards) => {
    if (cards.length < 4) {
      // Not enough cards for multiple choice
      setQuestions([])
      return
    }

    const shuffledCards = [...cards].sort(() => Math.random() - 0.5)

    const testQuestions = shuffledCards.map((card, index) => {
      // Get 3 random wrong answers from other cards
      const otherCards = cards.filter((_, i) => i !== cards.indexOf(card))
      const wrongAnswers = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => c.answer)

      // Combine correct answer with wrong answers and shuffle
      const allOptions = [card.answer, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      )

      return {
        id: index,
        question: card.question,
        correctAnswer: card.answer,
        options: allOptions,
      }
    })

    setQuestions(testQuestions)
  }

  const handleSelectAnswer = (answer) => {
    if (showFeedback) return
    setSelectedAnswer(answer)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) return

    const currentQuestion = questions[currentIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    setResults([
      ...results,
      {
        question: currentQuestion.question,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
      },
    ])

    setShowFeedback(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setIsComplete(true)
    }
  }

  const handleRestart = () => {
    generateQuestions(deck.cards || [])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setResults([])
    setIsComplete(false)
  }

  if (loading) {
    return <div className="test-loading">Loading...</div>
  }

  if (questions.length === 0) {
    return (
      <div className="test-error">
        <h2>Not enough cards</h2>
        <p>This deck needs at least 4 cards for Test mode.</p>
        <button onClick={() => navigate(`/study/${slug}`)}>Go Back</button>
      </div>
    )
  }

  if (isComplete) {
    const correctCount = results.filter((r) => r.isCorrect).length
    const percentage = Math.round((correctCount / questions.length) * 100)

    return (
      <div className="test-complete">
        <div className="complete-card">
          <h2>Test Complete!</h2>
          <div className="score-display">
            <div className="score-circle" data-percentage={percentage}>
              <span className="score-number">{correctCount}</span>
              <span className="score-divider">/</span>
              <span className="score-total">{questions.length}</span>
            </div>
            <p className="score-percentage">{percentage}% Correct</p>
          </div>

          <div className="results-summary">
            <h3>Review Answers</h3>
            <div className="results-list">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="result-icon">
                    {result.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="result-content">
                    <p className="result-question">{result.question}</p>
                    {!result.isCorrect && (
                      <>
                        <p className="result-your-answer">
                          Your answer: {result.selectedAnswer}
                        </p>
                        <p className="result-correct">
                          Correct: {result.correctAnswer}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="complete-actions">
            <button className="btn-restart" onClick={handleRestart}>
              Take Test Again
            </button>
            <button
              className="btn-modes"
              onClick={() => navigate(`/study/${slug}`)}
            >
              Try Another Mode
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="test-container">
      <header className="test-header">
        <button className="btn-back" onClick={() => navigate(`/study/${slug}`)}>
          ← Back
        </button>
        <h1>Test Mode</h1>
        <div className="test-progress">
          {currentIndex + 1} / {questions.length}
        </div>
      </header>

      <main className="test-main">
        <div className="question-card">
          <div className="question-number">Question {currentIndex + 1}</div>
          <p className="question-text">{currentQuestion.question}</p>
        </div>

        <div className="options-list">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrect = option === currentQuestion.correctAnswer
            let className = 'option-btn'

            if (showFeedback) {
              if (isCorrect) className += ' correct'
              else if (isSelected) className += ' incorrect'
            } else if (isSelected) {
              className += ' selected'
            }

            return (
              <button
                key={index}
                className={className}
                onClick={() => handleSelectAnswer(option)}
                disabled={showFeedback}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            )
          })}
        </div>

        <div className="test-actions">
          {!showFeedback ? (
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              Submit Answer
            </button>
          ) : (
            <button className="btn-next" onClick={handleNext}>
              {currentIndex < questions.length - 1
                ? 'Next Question →'
                : 'See Results'}
            </button>
          )}
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default TestMode
