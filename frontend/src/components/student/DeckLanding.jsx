import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import Branding from '../common/Branding'
import './DeckLanding.css'

function DeckLanding() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isTeacher, setIsTeacher] = useState(false)

  useEffect(() => {
    fetchDeck()
    checkIfTeacher()
  }, [slug])

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/study/${slug}/`)
      setDeck(response.data)
    } catch (err) {
      setError('Deck not found or not available')
    } finally {
      setLoading(false)
    }
  }

  const checkIfTeacher = async () => {
    try {
      const response = await api.get('/auth/me/')
      if (response.data) {
        setIsTeacher(true)
      }
    } catch (err) {
      setIsTeacher(false)
    }
  }

  const studyModes = [
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: 'Classic flip cards - tap to reveal answers',
      icon: '🎴',
      color: '#667eea',
    },
    {
      id: 'match',
      name: 'Match',
      description: 'Memory game - match questions with answers',
      icon: '🎯',
      color: '#10b981',
    },
    {
      id: 'learn',
      name: 'Learn',
      description: 'Type your answers and check your knowledge',
      icon: '📝',
      color: '#f59e0b',
    },
    {
      id: 'test',
      name: 'Test',
      description: 'Multiple choice quiz with instant feedback',
      icon: '📋',
      color: '#ef4444',
    },
    {
      id: 'gravity',
      name: 'Gravity',
      description: 'Race against falling questions - type fast!',
      icon: '🚀',
      color: '#8b5cf6',
    },
  ]

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="spinner"></div>
        <p>Loading deck...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="landing-error">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  return (
    <div className="deck-landing">
      {isTeacher && (
        <nav className="landing-nav">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
        </nav>
      )}
      <header className="landing-header">
        <Branding light />
        <div className="deck-badge">{deck.cards?.length} cards</div>
        <h1>{deck.title}</h1>
        <div className="deck-details">
          <span>{deck.subject_name}</span>
          {deck.exam_board && <span>{deck.exam_board}</span>}
          {deck.year_group && <span>{deck.year_group}</span>}
          {deck.target_grade && <span>{deck.target_grade}</span>}
        </div>
        <p className="deck-author">Created by {deck.display_author || deck.teacher_name}</p>
      </header>

      <main className="landing-main">
        <h2>Choose a Study Mode</h2>

        <div className="modes-grid">
          {studyModes.map((mode) => (
            <button
              key={mode.id}
              className="mode-card"
              style={{ '--mode-color': mode.color }}
              onClick={() => navigate(`/study/${slug}/${mode.id}`)}
            >
              <span className="mode-icon">{mode.icon}</span>
              <h3>{mode.name}</h3>
              <p>{mode.description}</p>
            </button>
          ))}
        </div>
      </main>

      <footer className="landing-footer">
        <p>Flashcard Generator - AI-powered study tools for students</p>
        <p className="copyright">© {new Date().getFullYear()} Dr Galan. All rights reserved. A <a href="https://coderra.je" target="_blank" rel="noopener noreferrer">Coderra.je</a> production.</p>
      </footer>
    </div>
  )
}

export default DeckLanding
