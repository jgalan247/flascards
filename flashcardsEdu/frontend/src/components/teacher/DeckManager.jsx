import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import './DeckManager.css'

function DeckManager({ teacher, onLogout }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedCards, setEditedCards] = useState([])

  useEffect(() => {
    fetchDeck()
  }, [slug])

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/decks/${slug}/`)
      setDeck(response.data)
      setEditedCards(response.data.cards || [])
    } catch (error) {
      console.error('Error fetching deck:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleCardChange = (index, field, value) => {
    const updated = [...editedCards]
    updated[index] = { ...updated[index], [field]: value }
    setEditedCards(updated)
  }

  const handleAddCard = () => {
    setEditedCards([
      ...editedCards,
      { question: '', answer: '', order: editedCards.length },
    ])
  }

  const handleDeleteCard = (index) => {
    if (editedCards.length <= 1) {
      alert('Deck must have at least one card')
      return
    }
    const updated = editedCards.filter((_, i) => i !== index)
    setEditedCards(updated.map((card, i) => ({ ...card, order: i })))
  }

  const handleMoveCard = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= editedCards.length) return

    const updated = [...editedCards]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setEditedCards(updated.map((card, i) => ({ ...card, order: i })))
  }

  const handleSave = async () => {
    // Validate cards
    const invalidCards = editedCards.filter(
      (card) => !card.question?.trim() || !card.answer?.trim()
    )
    if (invalidCards.length > 0) {
      alert('All cards must have a question and answer')
      return
    }

    setSaving(true)
    try {
      await api.put(`/decks/${slug}/update_cards/`, { cards: editedCards })
      alert('Deck saved successfully!')
      navigate('/')
    } catch (error) {
      console.error('Error saving deck:', error)
      alert('Error saving deck')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateDeckInfo = async (field, value) => {
    try {
      await api.patch(`/decks/${slug}/`, { [field]: value })
      setDeck({ ...deck, [field]: value })
    } catch (error) {
      console.error('Error updating deck:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading deck...</div>
  }

  if (!deck) {
    return <div className="error">Deck not found</div>
  }

  return (
    <div className="deck-manager">
      <header className="manager-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h1>Edit Deck</h1>
        <button className="btn-logout" onClick={onLogout}>
          Sign Out
        </button>
      </header>

      <main className="manager-main">
        <div className="deck-info-section">
          <div className="info-field">
            <label>Deck Title</label>
            <input
              type="text"
              value={deck.title}
              onChange={(e) => setDeck({ ...deck, title: e.target.value })}
              onBlur={(e) => handleUpdateDeckInfo('title', e.target.value)}
            />
          </div>
          <div className="info-row">
            <div className="info-field">
              <label>Exam Board</label>
              <input
                type="text"
                value={deck.exam_board || ''}
                onChange={(e) => setDeck({ ...deck, exam_board: e.target.value })}
                onBlur={(e) => handleUpdateDeckInfo('exam_board', e.target.value)}
              />
            </div>
            <div className="info-field">
              <label>Year Group</label>
              <input
                type="text"
                value={deck.year_group || ''}
                onChange={(e) => setDeck({ ...deck, year_group: e.target.value })}
                onBlur={(e) => handleUpdateDeckInfo('year_group', e.target.value)}
              />
            </div>
            <div className="info-field">
              <label>Target Grade</label>
              <input
                type="text"
                value={deck.target_grade || ''}
                onChange={(e) => setDeck({ ...deck, target_grade: e.target.value })}
                onBlur={(e) => handleUpdateDeckInfo('target_grade', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="cards-section">
          <div className="cards-header">
            <h2>Cards ({editedCards.length})</h2>
            <button className="btn-add" onClick={handleAddCard}>
              + Add Card
            </button>
          </div>

          <div className="cards-list">
            {editedCards.map((card, index) => (
              <div key={index} className="card-editor">
                <div className="card-controls">
                  <span className="card-number">{index + 1}</span>
                  <div className="card-move-buttons">
                    <button
                      className="btn-move"
                      onClick={() => handleMoveCard(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="btn-move"
                      onClick={() => handleMoveCard(index, 1)}
                      disabled={index === editedCards.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <div className="card-fields">
                  <div className="field-group">
                    <label>Question</label>
                    <textarea
                      value={card.question}
                      onChange={(e) =>
                        handleCardChange(index, 'question', e.target.value)
                      }
                      placeholder="Enter question..."
                      rows={2}
                    />
                  </div>
                  <div className="field-group">
                    <label>Answer</label>
                    <textarea
                      value={card.answer}
                      onChange={(e) =>
                        handleCardChange(index, 'answer', e.target.value)
                      }
                      placeholder="Enter answer..."
                      rows={2}
                    />
                  </div>
                </div>

                <button
                  className="btn-delete-card"
                  onClick={() => handleDeleteCard(index)}
                  title="Delete card"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="manager-actions">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default DeckManager
