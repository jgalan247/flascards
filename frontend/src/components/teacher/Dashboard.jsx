import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import LoadingSpinner from '../common/LoadingSpinner'
import './Dashboard.css'

function Dashboard({ teacher, onLogout }) {
  const [decks, setDecks] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingSlug, setDeletingSlug] = useState(null)
  const [error, setError] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError('')
      const [decksRes, subjectsRes] = await Promise.all([
        api.get('/decks/'),
        api.get('/subjects/'),
      ])
      setDecks(decksRes.data)
      setSubjects(subjectsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load decks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDeck = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this deck?')) return

    setDeletingSlug(slug)
    setError('')
    try {
      await api.delete(`/decks/${slug}/`)
      setDecks(decks.filter((d) => d.slug !== slug))
    } catch (error) {
      console.error('Error deleting deck:', error)
      setError('Failed to delete deck. Please try again.')
    } finally {
      setDeletingSlug(null)
    }
  }

  const copyShareLink = (slug) => {
    const link = `${window.location.origin}/study/${slug}`
    navigator.clipboard.writeText(link)
    alert('Link copied to clipboard!')
  }

  const filteredDecks = filterSubject
    ? decks.filter((d) => d.subject === parseInt(filterSubject))
    : decks

  if (loading) {
    return <LoadingSpinner message="Loading your decks..." fullPage />
  }

  return (
    <div className="dashboard">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>My Flashcard Decks</h1>
          <p>Welcome back, {teacher.name}</p>
        </div>
        <div className="header-right">
          <button className="btn-create" onClick={() => navigate('/create')}>
            + Create New Deck
          </button>
          <button className="btn-logout" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="filters">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.deck_count})
              </option>
            ))}
          </select>
        </div>

        {filteredDecks.length === 0 ? (
          <div className="empty-state">
            <h2>No decks yet</h2>
            <p>Create your first flashcard deck to get started!</p>
            <button className="btn-create" onClick={() => navigate('/create')}>
              Create Your First Deck
            </button>
          </div>
        ) : (
          <div className="decks-grid">
            {filteredDecks.map((deck) => (
              <div key={deck.id} className="deck-card">
                <div className="deck-info">
                  <h3>{deck.title}</h3>
                  <p className="deck-subject">{deck.subject_name}</p>
                  <div className="deck-meta">
                    <span>{deck.card_count} cards</span>
                    <span>{deck.exam_board}</span>
                    <span>{deck.year_group}</span>
                  </div>
                </div>
                <div className="deck-actions">
                  <button
                    className="btn-share"
                    onClick={() => copyShareLink(deck.slug)}
                    title="Copy share link"
                  >
                    Share
                  </button>
                  <button
                    className="btn-preview"
                    onClick={() => navigate(`/study/${deck.slug}`)}
                    title="Preview deck"
                  >
                    Preview
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/deck/${deck.slug}/edit`)}
                    title="Edit deck"
                  >
                    Edit
                  </button>
                  <button
                    className={`btn-delete ${deletingSlug === deck.slug ? 'btn-loading' : ''}`}
                    onClick={() => handleDeleteDeck(deck.slug)}
                    disabled={deletingSlug === deck.slug}
                    title="Delete deck"
                  >
                    {deletingSlug === deck.slug ? (
                      <LoadingSpinner size="small" message="" />
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
