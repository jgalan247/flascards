import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import LoadingSpinner from '../common/LoadingSpinner'
import Branding from '../common/Branding'
import './MatchGame.css'

function MatchGame() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [tiles, setTiles] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeck()
  }, [slug])

  useEffect(() => {
    let interval
    if (isRunning && !gameComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, gameComplete])

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/study/${slug}/`)
      setDeck(response.data)
      initializeGame(response.data.cards || [])
    } catch (error) {
      console.error('Error fetching deck:', error)
      navigate(`/study/${slug}`)
    } finally {
      setLoading(false)
    }
  }

  const initializeGame = (cards) => {
    // Take first 8 cards for 4x4 grid (or fewer if deck is smaller)
    const gameCards = cards.slice(0, 8)

    // Create pairs of tiles
    const gameTiles = []
    gameCards.forEach((card, index) => {
      gameTiles.push({
        id: `q-${index}`,
        pairId: index,
        content: card.question,
        type: 'question',
      })
      gameTiles.push({
        id: `a-${index}`,
        pairId: index,
        content: card.answer,
        type: 'answer',
      })
    })

    // Shuffle tiles
    const shuffled = gameTiles.sort(() => Math.random() - 0.5)
    setTiles(shuffled)
    setFlipped([])
    setMatched([])
    setAttempts(0)
    setTimer(0)
    setIsRunning(false)
    setGameComplete(false)
  }

  const handleTileClick = useCallback(
    (tile) => {
      // Start timer on first click
      if (!isRunning) {
        setIsRunning(true)
      }

      // Don't allow clicking if:
      // - Already 2 tiles flipped
      // - Tile is already matched
      // - Tile is already flipped
      if (
        flipped.length >= 2 ||
        matched.includes(tile.id) ||
        flipped.includes(tile.id)
      ) {
        return
      }

      const newFlipped = [...flipped, tile.id]
      setFlipped(newFlipped)

      // Check for match when 2 tiles are flipped
      if (newFlipped.length === 2) {
        setAttempts((prev) => prev + 1)

        const [firstId, secondId] = newFlipped
        const firstTile = tiles.find((t) => t.id === firstId)
        const secondTile = tiles.find((t) => t.id === secondId)

        if (
          firstTile.pairId === secondTile.pairId &&
          firstTile.type !== secondTile.type
        ) {
          // Match found!
          const newMatched = [...matched, firstId, secondId]
          setMatched(newMatched)
          setFlipped([])

          // Check for game completion
          if (newMatched.length === tiles.length) {
            setGameComplete(true)
            setIsRunning(false)
          }
        } else {
          // No match - flip back after delay
          setTimeout(() => {
            setFlipped([])
          }, 1000)
        }
      }
    },
    [flipped, matched, tiles, isRunning]
  )

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayAgain = () => {
    initializeGame(deck.cards || [])
  }

  if (loading) {
    return <LoadingSpinner message="Loading match game..." fullPage />
  }

  if (gameComplete) {
    return (
      <div className="match-complete">
        <div className="complete-card">
          <h2>🎉 Congratulations!</h2>
          <p>You matched all the cards!</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{formatTime(timer)}</span>
              <span className="stat-label">Time</span>
            </div>
            <div className="stat">
              <span className="stat-value">{attempts}</span>
              <span className="stat-label">Attempts</span>
            </div>
          </div>
          <div className="complete-actions">
            <button className="btn-play-again" onClick={handlePlayAgain}>
              Play Again
            </button>
            <button
              className="btn-back-modes"
              onClick={() => navigate(`/study/${slug}`)}
            >
              Try Another Mode
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="match-container">
      <Branding />
      <header className="match-header">
        <button className="btn-back" onClick={() => navigate(`/study/${slug}`)}>
          ← Back
        </button>
        <h1>Match Game</h1>
        <div className="match-stats">
          <span className="timer">⏱ {formatTime(timer)}</span>
          <span className="attempts">Attempts: {attempts}</span>
        </div>
      </header>

      <main className="match-main">
        <p className="match-instructions">
          Match questions with their answers!
        </p>

        <div
          className="tiles-grid"
          style={{
            gridTemplateColumns: `repeat(${Math.min(4, Math.ceil(Math.sqrt(tiles.length)))}, 1fr)`,
          }}
        >
          {tiles.map((tile) => {
            const isFlipped = flipped.includes(tile.id)
            const isMatched = matched.includes(tile.id)

            return (
              <button
                key={tile.id}
                className={`tile ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''} ${tile.type}`}
                onClick={() => handleTileClick(tile)}
                disabled={isMatched}
              >
                <div className="tile-inner">
                  <div className="tile-front">?</div>
                  <div className="tile-back">
                    <span>{tile.content}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="match-progress">
          <span>
            {matched.length / 2} / {tiles.length / 2} pairs matched
          </span>
        </div>
      </main>
    </div>
  )
}

export default MatchGame
