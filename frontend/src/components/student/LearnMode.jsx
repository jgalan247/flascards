import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { fuzzyMatch } from '../../utils/cardParser'
import LoadingSpinner from '../common/LoadingSpinner'
import Branding from '../common/Branding'
import './LearnMode.css'

function LearnMode() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null) // null, 'correct', 'incorrect', 'shown'
  const [score, setScore] = useState({ correct: 0, incorrect: 0, shown: 0 })
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeck()
  }, [slug])

  useEffect(() => {
    if (inputRef.current && !feedback) {
      inputRef.current.focus()
    }
  }, [currentIndex, feedback])

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/study/${slug}/`)
      setDeck(response.data)
      // Shuffle cards for learning
      const shuffled = [...(response.data.cards || [])].sort(
        () => Math.random() - 0.5
      )
      setCards(shuffled)
    } catch (error) {
      console.error('Error fetching deck:', error)
      navigate(`/study/${slug}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = () => {
    const currentCard = cards[currentIndex]
    const result = fuzzyMatch(userAnswer, currentCard.answer, 0.7)

    if (result.match) {
      setFeedback('correct')
      setScore({ ...score, correct: score.correct + 1 })
    } else {
      setFeedback('incorrect')
      setScore({ ...score, incorrect: score.incorrect + 1 })
    }
  }

  const handleShowAnswer = () => {
    setFeedback('shown')
    setScore({ ...score, shown: score.shown + 1 })
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setFeedback(null)
    } else {
      setIsComplete(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !feedback) {
      handleCheck()
    }
  }

  const handleRestart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback(null)
    setScore({ correct: 0, incorrect: 0, shown: 0 })
    setIsComplete(false)
  }

  if (loading) {
    return <LoadingSpinner message="Loading learn mode..." fullPage />
  }

  if (isComplete) {
    const total = cards.length
    const percentage = Math.round((score.correct / total) * 100)

    return (
      <div className="learn-complete">
        <div className="complete-card">
          <h2>Session Complete!</h2>
          <div className="score-circle">
            <span className="score-percentage">{percentage}%</span>
            <span className="score-label">Correct</span>
          </div>
          <div className="score-breakdown">
            <div className="score-item correct">
              <span className="score-value">{score.correct}</span>
              <span className="score-text">Correct</span>
            </div>
            <div className="score-item incorrect">
              <span className="score-value">{score.incorrect}</span>
              <span className="score-text">Incorrect</span>
            </div>
            <div className="score-item shown">
              <span className="score-value">{score.shown}</span>
              <span className="score-text">Shown</span>
            </div>
          </div>
          <div className="complete-actions">
            <button className="btn-restart" onClick={handleRestart}>
              Study Again
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

  const currentCard = cards[currentIndex]

  return (
    <div className="learn-container">
      <Branding />
      <header className="learn-header">
        <button className="btn-back" onClick={() => navigate(`/study/${slug}`)}>
          ← Back
        </button>
        <h1>Learn Mode</h1>
        <div className="learn-progress">
          {currentIndex + 1} / {cards.length}
        </div>
      </header>

      <main className="learn-main">
        <div className="question-card">
          <div className="question-label">Question</div>
          <p className="question-text">{currentCard?.question}</p>
        </div>

        <div className="answer-section">
          {!feedback ? (
            <>
              <input
                ref={inputRef}
                type="text"
                className="answer-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                autoComplete="off"
              />
              <div className="answer-actions">
                <button
                  className="btn-check"
                  onClick={handleCheck}
                  disabled={!userAnswer.trim()}
                >
                  Check Answer
                </button>
                <button className="btn-show" onClick={handleShowAnswer}>
                  Don't know - Show me
                </button>
              </div>
            </>
          ) : (
            <div className={`feedback-section ${feedback}`}>
              <div className="feedback-message">
                {feedback === 'correct' && (
                  <>
                    <span className="feedback-icon">✓</span>
                    <span>Correct!</span>
                  </>
                )}
                {feedback === 'incorrect' && (
                  <>
                    <span className="feedback-icon">✗</span>
                    <span>Not quite...</span>
                  </>
                )}
                {feedback === 'shown' && (
                  <>
                    <span className="feedback-icon">👁</span>
                    <span>Here's the answer</span>
                  </>
                )}
              </div>

              {feedback !== 'correct' && userAnswer && (
                <div className="your-answer">
                  <strong>Your answer:</strong> {userAnswer}
                </div>
              )}

              <div className="correct-answer">
                <strong>Correct answer:</strong>
                <p>{currentCard?.answer}</p>
              </div>

              <button className="btn-next" onClick={handleNext}>
                {currentIndex < cards.length - 1
                  ? 'Next Question →'
                  : 'See Results'}
              </button>
            </div>
          )}
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </main>
    </div>
  )
}

export default LearnMode
