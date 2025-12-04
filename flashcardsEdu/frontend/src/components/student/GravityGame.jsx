import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { fuzzyMatch } from '../../utils/cardParser'
import LoadingSpinner from '../common/LoadingSpinner'
import './GravityGame.css'

function GravityGame() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const gameLoopRef = useRef(null)
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [fallingQuestions, setFallingQuestions] = useState([])
  const [userInput, setUserInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState('loading') // loading, ready, playing, paused, gameover
  const [speed, setSpeed] = useState(1)
  const [loading, setLoading] = useState(true)
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    fetchDeck()
    const saved = localStorage.getItem(`gravity-highscore-${slug}`)
    if (saved) setHighScore(parseInt(saved))
  }, [slug])

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState])

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/study/${slug}/`)
      setDeck(response.data)
      setCards(response.data.cards || [])
      setGameState('ready')
    } catch (error) {
      console.error('Error fetching deck:', error)
      navigate(`/study/${slug}`)
    } finally {
      setLoading(false)
    }
  }

  const getRandomCard = useCallback(() => {
    if (cards.length === 0) return null
    const index = Math.floor(Math.random() * cards.length)
    return { ...cards[index], id: Date.now() + Math.random() }
  }, [cards])

  const startGame = () => {
    setScore(0)
    setStreak(0)
    setLives(3)
    setSpeed(1)
    setFallingQuestions([])
    setUserInput('')
    setGameState('playing')
  }

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnInterval = Math.max(3000 - speed * 200, 1000) // Faster spawning as speed increases

    const spawnQuestion = () => {
      const card = getRandomCard()
      if (card) {
        setFallingQuestions((prev) => [
          ...prev,
          {
            ...card,
            x: Math.random() * 70 + 15, // 15-85% of width
            y: 0,
          },
        ])
      }
    }

    // Initial spawn
    spawnQuestion()

    const spawnTimer = setInterval(spawnQuestion, spawnInterval)

    return () => clearInterval(spawnTimer)
  }, [gameState, speed, getRandomCard])

  // Movement loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const moveQuestions = () => {
      setFallingQuestions((prev) => {
        const updated = prev.map((q) => ({
          ...q,
          y: q.y + 0.3 + speed * 0.1, // Faster fall with speed
        }))

        // Check for questions that hit the bottom
        const hitBottom = updated.filter((q) => q.y >= 90)
        if (hitBottom.length > 0) {
          setLives((l) => {
            const newLives = l - hitBottom.length
            if (newLives <= 0) {
              setGameState('gameover')
            }
            return Math.max(0, newLives)
          })
          setStreak(0)
        }

        return updated.filter((q) => q.y < 90)
      })
    }

    gameLoopRef.current = setInterval(moveQuestions, 50)

    return () => clearInterval(gameLoopRef.current)
  }, [gameState, speed])

  // Increase speed over time
  useEffect(() => {
    if (gameState !== 'playing') return

    const speedTimer = setInterval(() => {
      setSpeed((s) => Math.min(s + 0.2, 5))
    }, 10000)

    return () => clearInterval(speedTimer)
  }, [gameState])

  const handleInputChange = (e) => {
    setUserInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Check if answer matches any falling question
    let matched = false
    setFallingQuestions((prev) => {
      const matchIndex = prev.findIndex((q) => {
        const result = fuzzyMatch(userInput, q.answer, 0.7)
        return result.match
      })

      if (matchIndex !== -1) {
        matched = true
        const matchedQ = prev[matchIndex]
        const positionBonus = Math.floor((90 - matchedQ.y) / 10)
        const streakBonus = streak * 5
        const points = 10 + positionBonus + streakBonus

        setScore((s) => s + points)
        setStreak((s) => s + 1)

        return prev.filter((_, i) => i !== matchIndex)
      }
      return prev
    })

    if (!matched) {
      setStreak(0)
    }

    setUserInput('')
  }

  // Save high score on game over
  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      setHighScore(score)
      localStorage.setItem(`gravity-highscore-${slug}`, score.toString())
    }
  }, [gameState, score, highScore, slug])

  if (loading) {
    return <LoadingSpinner message="Loading gravity game..." fullPage />
  }

  if (gameState === 'ready') {
    return (
      <div className="gravity-start">
        <div className="start-card">
          <h1>🚀 Gravity</h1>
          <p>Questions fall from the sky!</p>
          <p>Type the correct answer before they hit the ground.</p>
          <div className="rules">
            <p>• 3 lives - lose one when a question hits bottom</p>
            <p>• Build streaks for bonus points</p>
            <p>• Speed increases over time</p>
          </div>
          {highScore > 0 && (
            <p className="high-score">High Score: {highScore}</p>
          )}
          <button className="btn-start" onClick={startGame}>
            Start Game
          </button>
          <button
            className="btn-back-modes"
            onClick={() => navigate(`/study/${slug}`)}
          >
            ← Back to Modes
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'gameover') {
    return (
      <div className="gravity-gameover">
        <div className="gameover-card">
          <h2>Game Over!</h2>
          <div className="final-score">
            <span className="score-value">{score}</span>
            <span className="score-label">points</span>
          </div>
          {score > highScore - score && score === highScore && (
            <p className="new-record">🎉 New High Score!</p>
          )}
          <p className="high-score">High Score: {highScore}</p>
          <div className="gameover-actions">
            <button className="btn-play-again" onClick={startGame}>
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
    <div className="gravity-container">
      <header className="gravity-header">
        <button
          className="btn-back"
          onClick={() => setGameState('ready')}
        >
          ← Quit
        </button>
        <div className="game-stats">
          <span className="stat-score">Score: {score}</span>
          <span className="stat-streak">Streak: {streak}🔥</span>
          <span className="stat-lives">
            {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
          </span>
        </div>
      </header>

      <main className="gravity-arena">
        <div className="questions-area">
          {fallingQuestions.map((q) => (
            <div
              key={q.id}
              className="falling-question"
              style={{
                left: `${q.x}%`,
                top: `${q.y}%`,
              }}
            >
              {q.question}
            </div>
          ))}
        </div>

        <div className="danger-zone"></div>

        <form className="answer-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your answer..."
            autoComplete="off"
          />
          <button type="submit">Fire!</button>
        </form>
      </main>
    </div>
  )
}

export default GravityGame
