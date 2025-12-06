import { useState } from 'react'
import './AppFlowGuide.css'

function AppFlowGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  const steps = [
    {
      number: 1,
      icon: '📝',
      title: 'Build Your Prompt',
      description: 'Use our 10-step wizard to create a tailored AI prompt for your subject, topic, and exam board.',
    },
    {
      number: 2,
      icon: '🤖',
      title: 'Generate with AI',
      description: 'Copy the prompt to ChatGPT or NotebookLM and let AI create exam-focused flashcards.',
    },
    {
      number: 3,
      icon: '📋',
      title: 'Paste & Import',
      description: 'Paste the AI response back into the app. We automatically parse and format your cards.',
    },
    {
      number: 4,
      icon: '✏️',
      title: 'Review & Edit',
      description: 'Fine-tune your flashcards, fix any errors, and add your own questions.',
    },
    {
      number: 5,
      icon: '🔗',
      title: 'Share with Students',
      description: 'Get a shareable link. Students can study instantly - no login required!',
    },
    {
      number: 6,
      icon: '🎮',
      title: 'Students Learn',
      description: '5 study modes: Flashcards, Match Game, Learn, Test, and Gravity Game.',
    },
  ]

  return (
    <div className="app-flow-guide">
      <button
        className="guide-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide' : 'Show'} How It Works
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="guide-content">
          <h3>How to Create Flashcards</h3>

          <div className="flow-steps">
            {steps.map((step, index) => (
              <div key={step.number} className="flow-step">
                <div className="step-icon">{step.icon}</div>
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <div className="connector-line"></div>
                    <div className="connector-arrow">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="guide-footer">
            <p>Ready to get started?</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppFlowGuide
