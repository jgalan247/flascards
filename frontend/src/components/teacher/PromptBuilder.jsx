import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { promptSteps, generatePrompt, generateNotebookLMPrompt } from '../../utils/promptGenerator'
import { parseCards, validateCards } from '../../utils/cardParser'
import api from '../../utils/api'
import './PromptBuilder.css'

function PromptBuilder({ teacher, onLogout }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    learningObjectives: '',
    examBoard: '',
    boardNuances: '',
    misconceptions: '',
    yearGroup: '',
    targetGrade: '',
    accessibility: '',
    cardCount: 20,
  })
  const [promptType, setPromptType] = useState('chatgpt') // 'chatgpt' or 'notebooklm'
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [parsedCards, setParsedCards] = useState(null)
  const [parseError, setParseError] = useState('')
  const [deckTitle, setDeckTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [phase, setPhase] = useState('wizard') // wizard, prompt, paste, review, save
  const navigate = useNavigate()

  const step = promptSteps[currentStep]

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleNext = () => {
    if (currentStep < promptSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Generate prompt and move to next phase
      const prompt = promptType === 'notebooklm'
        ? generateNotebookLMPrompt(formData)
        : generatePrompt(formData)
      setGeneratedPrompt(prompt)
      setPhase('prompt')
    }
  }

  const handlePromptTypeChange = (type) => {
    setPromptType(type)
    const prompt = type === 'notebooklm'
      ? generateNotebookLMPrompt(formData)
      : generatePrompt(formData)
    setGeneratedPrompt(prompt)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
    const destination = promptType === 'notebooklm' ? 'NotebookLM' : 'ChatGPT or Claude'
    alert(`Prompt copied! Paste it into ${destination}.`)
  }

  const handleParseResponse = () => {
    setParseError('')
    const cards = parseCards(aiResponse)
    const validation = validateCards(cards)

    if (validation.valid) {
      setParsedCards(validation.cards)
      setDeckTitle(`${formData.topic} - ${formData.yearGroup}`)
      setPhase('review')
    } else {
      setParseError(validation.error || 'Could not parse cards. Please check the format.')
    }
  }

  const handleSaveDeck = async () => {
    if (!deckTitle.trim()) {
      alert('Please enter a deck title')
      return
    }

    setSaving(true)
    try {
      const response = await api.post('/decks/', {
        title: deckTitle,
        subject_name: formData.subject,
        exam_board: formData.examBoard,
        year_group: formData.yearGroup,
        target_grade: formData.targetGrade,
        cards: parsedCards,
      })

      navigate(`/study/${response.data.slug}`)
    } catch (error) {
      console.error('Error saving deck:', error)
      alert('Error saving deck. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const renderWizard = () => (
    <div className="wizard-container">
      <div className="wizard-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / promptSteps.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Step {currentStep + 1} of {promptSteps.length}
        </span>
      </div>

      <div className="wizard-content">
        <div className="step-header">
          <h2>{step.label}</h2>
          <div className="step-explanation">
            <p>{step.explanation}</p>
            <div className="step-example">
              <strong>Example:</strong> {step.example}
            </div>
          </div>
        </div>

        <div className="step-input">
          {step.options ? (
            <select
              value={formData[step.field]}
              onChange={(e) => handleInputChange(step.field, e.target.value)}
            >
              <option value="">Select {step.label}...</option>
              {step.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : step.multiline ? (
            <textarea
              value={formData[step.field]}
              onChange={(e) => handleInputChange(step.field, e.target.value)}
              placeholder={step.placeholder}
              rows={4}
            />
          ) : (
            <input
              type={step.type || 'text'}
              value={formData[step.field]}
              onChange={(e) => handleInputChange(step.field, e.target.value)}
              placeholder={step.placeholder}
              min={step.min}
              max={step.max}
            />
          )}
        </div>

        <div className="prompt-preview">
          <h4>Your prompt so far:</h4>
          <pre>{generatePrompt(formData)}</pre>
        </div>
      </div>

      <div className="wizard-actions">
        <button
          className="btn-secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </button>
        <button className="btn-primary" onClick={handleNext}>
          {currentStep === promptSteps.length - 1 ? 'Generate Prompt' : 'Next'}
        </button>
      </div>
    </div>
  )

  const renderPromptPhase = () => (
    <div className="prompt-phase">
      <h2>Your AI Prompt is Ready!</h2>

      <div className="prompt-type-selector">
        <p>Choose your AI tool:</p>
        <div className="prompt-type-buttons">
          <button
            className={`prompt-type-btn ${promptType === 'chatgpt' ? 'active' : ''}`}
            onClick={() => handlePromptTypeChange('chatgpt')}
          >
            <span className="prompt-type-icon">💬</span>
            <span className="prompt-type-label">ChatGPT / Claude</span>
            <span className="prompt-type-desc">General AI knowledge</span>
          </button>
          <button
            className={`prompt-type-btn ${promptType === 'notebooklm' ? 'active' : ''}`}
            onClick={() => handlePromptTypeChange('notebooklm')}
          >
            <span className="prompt-type-icon">📚</span>
            <span className="prompt-type-label">NotebookLM</span>
            <span className="prompt-type-desc">Uses your uploaded sources</span>
          </button>
        </div>
      </div>

      {promptType === 'notebooklm' && (
        <div className="notebooklm-tip">
          <strong>Tip:</strong> Before using this prompt, upload your course materials
          (textbooks, notes, past papers) to NotebookLM. The AI will create flashcards
          based only on your uploaded sources.
        </div>
      )}

      <p className="prompt-instruction">
        Copy this prompt and paste it into {promptType === 'notebooklm' ? 'NotebookLM' : 'ChatGPT or Claude'}:
      </p>

      <div className="prompt-display">
        <pre>{generatedPrompt}</pre>
        <button className="btn-copy" onClick={handleCopyPrompt}>
          Copy to Clipboard
        </button>
      </div>

      <div className="next-step">
        <button className="btn-primary" onClick={() => setPhase('paste')}>
          I've got my AI response - Continue
        </button>
        <button className="btn-secondary" onClick={() => setPhase('wizard')}>
          Edit Prompt Settings
        </button>
      </div>
    </div>
  )

  const renderPastePhase = () => (
    <div className="paste-phase">
      <h2>Paste AI Response</h2>
      <p>
        Paste the entire response from {promptType === 'notebooklm' ? 'NotebookLM' : 'ChatGPT or Claude'} below:
      </p>

      <textarea
        className="ai-response-input"
        value={aiResponse}
        onChange={(e) => setAiResponse(e.target.value)}
        placeholder={`Paste the ${promptType === 'notebooklm' ? 'NotebookLM' : 'AI'}'s response here...`}
        rows={12}
      />

      {parseError && <div className="error-message">{parseError}</div>}

      <div className="paste-actions">
        <button className="btn-secondary" onClick={() => setPhase('prompt')}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={handleParseResponse}
          disabled={!aiResponse.trim()}
        >
          Parse Flashcards
        </button>
      </div>
    </div>
  )

  const renderReviewPhase = () => (
    <div className="review-phase">
      <h2>Review Your Flashcards</h2>
      <p>{parsedCards?.length} cards parsed successfully!</p>

      <div className="deck-title-input">
        <label>Deck Title:</label>
        <input
          type="text"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          placeholder="Enter deck title..."
        />
      </div>

      <div className="cards-preview">
        {parsedCards?.map((card, index) => (
          <div key={index} className="card-preview">
            <div className="card-number">{index + 1}</div>
            <div className="card-content">
              <div className="card-question">
                <strong>Q:</strong> {card.question}
              </div>
              <div className="card-answer">
                <strong>A:</strong> {card.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="review-actions">
        <button className="btn-secondary" onClick={() => setPhase('paste')}>
          Edit Response
        </button>
        <button
          className="btn-primary"
          onClick={handleSaveDeck}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Deck'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="prompt-builder">
      <header className="builder-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h1>Create Flashcard Deck</h1>
        <button className="btn-logout" onClick={onLogout}>
          Sign Out
        </button>
      </header>

      <main className="builder-main">
        {phase === 'wizard' && renderWizard()}
        {phase === 'prompt' && renderPromptPhase()}
        {phase === 'paste' && renderPastePhase()}
        {phase === 'review' && renderReviewPhase()}
      </main>
    </div>
  )
}

export default PromptBuilder
