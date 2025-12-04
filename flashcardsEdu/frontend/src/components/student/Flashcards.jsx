import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import LoadingSpinner from '../common/LoadingSpinner'
import './Flashcards.css'

function Flashcards() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCards, setKnownCards] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeck()
  }, [slug])

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/study/${slug}/`)
      setDeck(response.data)
      setCards(response.data.cards || [])
    } catch (error) {
      console.error('Error fetching deck:', error)
      navigate(`/study/${slug}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownCards(new Set())
  }

  const handleMarkKnown = () => {
    const newKnown = new Set(knownCards)
    if (knownCards.has(currentIndex)) {
      newKnown.delete(currentIndex)
    } else {
      newKnown.add(currentIndex)
    }
    setKnownCards(newKnown)
  }

  const handleKeyDown = (e) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        handleFlip()
        break
      case 'ArrowRight':
        handleNext()
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      default:
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isFlipped, cards.length])

  if (loading) {
    return <LoadingSpinner message="Loading flashcards..." fullPage />
  }

  if (!cards.length) {
    return (
      <div className="flashcards-empty">
        <p>No cards in this deck</p>
        <button onClick={() => navigate(`/study/${slug}`)}>Go Back</button>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const isKnown = knownCards.has(currentIndex)

  return (
    <div className="flashcards-container">
      <header className="flashcards-header">
        <button className="btn-back" onClick={() => navigate(`/study/${slug}`)}>
          ← Back
        </button>
        <h1>{deck?.title}</h1>
        <div className="progress-info">
          {currentIndex + 1} / {cards.length}
          <span className="known-count">({knownCards.size} known)</span>
        </div>
      </header>

      <main className="flashcards-main">
        <div className="card-area" onClick={handleFlip}>
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-front">
              <div className="card-label">Question</div>
              <p>{currentCard.question}</p>
            </div>
            <div className="card-back">
              <div className="card-label">Answer</div>
              <p>{currentCard.answer}</p>
            </div>
          </div>
          <p className="flip-hint">Tap or press Space to flip</p>
        </div>

        <div className="card-controls">
          <button
            className="btn-nav"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <button
            className={`btn-known ${isKnown ? 'active' : ''}`}
            onClick={handleMarkKnown}
          >
            {isKnown ? '✓ Known' : 'Mark as Known'}
          </button>

          <button
            className="btn-nav"
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
          >
            Next →
          </button>
        </div>

        <div className="extra-controls">
          <button className="btn-shuffle" onClick={handleShuffle}>
            🔀 Shuffle Cards
          </button>
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

export default Flashcards
