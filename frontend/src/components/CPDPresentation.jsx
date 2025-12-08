import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CPDPresentation.css'

const slides = [
  // Slide 1: Title
  {
    type: 'title',
    content: {
      badge: 'AI-POWERED LEARNING',
      title: 'AI in the Classroom',
      subtitle: 'Creating exam-focused flashcards with AI assistance',
      author: 'Jose Galan',
      url: 'flashcards.cshub.org.je'
    }
  },
  // Slide 2: Session Overview
  {
    type: 'overview',
    content: {
      title: 'Session Overview',
      duration: '30 minutes',
      items: [
        { title: 'Why flashcards work', desc: 'The science of active recall', time: '5 min' },
        { title: 'Live demo', desc: 'Creating a deck from scratch', time: '10 min' },
        { title: 'Hands-on practice', desc: 'Your turn to create', time: '10 min' },
        { title: 'Q&A and tips', desc: 'Getting the most from the tool', time: '5 min' }
      ]
    }
  },
  // Slide 3: The Problem
  {
    type: 'problem',
    content: {
      title: 'The Problem',
      subtitle: 'Sound familiar?',
      problems: [
        { icon: '📚', title: 'Revision resources take hours to create', desc: 'Time you don\'t have during term' },
        { icon: '🎯', title: 'Generic materials miss your specification', desc: 'Wrong exam board, wrong focus' },
        { icon: '😴', title: 'Students re-read notes passively', desc: 'Low-effort = low retention' },
        { icon: '🔄', title: 'Hard to differentiate at scale', desc: 'Same worksheet for everyone' }
      ]
    }
  },
  // Slide 4: The Solution
  {
    type: 'solution',
    content: {
      title: 'The Solution',
      subtitle: 'AI-assisted flashcard creation',
      features: [
        { icon: '⚡', title: 'Minutes, not hours', desc: '10-step wizard + AI = done' },
        { icon: '🎓', title: 'Exam-board specific', desc: 'AQA, Edexcel, OCR built in' },
        { icon: '🧠', title: 'Active recall by design', desc: 'Students retrieve, not just read' },
        { icon: '♿', title: 'SEND-friendly options', desc: 'Dyslexia, EAL, visual supports' }
      ]
    }
  },
  // Slide 5: Live Demo
  {
    type: 'demo',
    content: {
      badge: 'LIVE DEMO',
      title: 'flashcards.cshub.org.je',
      subtitle: 'Creating a flashcard deck from scratch',
      steps: [
        { label: 'Build prompt', active: false },
        { label: 'Copy to AI', active: false },
        { label: 'Paste response', active: false },
        { label: 'Share link', active: true }
      ]
    }
  },
  // Slide 6: Four Study Modes
  {
    type: 'modes',
    content: {
      title: 'Four Study Modes',
      subtitle: 'Students choose how they want to learn – same cards, different approaches',
      modes: [
        { color: '#0D9488', title: 'Flashcards', desc: 'Classic flip cards. Tap to reveal answer. Self-assess and track progress.' },
        { color: '#F97316', title: 'Match', desc: 'Pair questions with answers against the clock. Fun competition mode.' },
        { color: '#8B5CF6', title: 'Learn', desc: 'Type answers. Spaced repetition prioritises weak areas automatically.' },
        { color: '#EC4899', title: 'Test', desc: 'Written responses with AI feedback. Best for exam-style practice.' }
      ]
    }
  },
  // Slide 7: Why This Works
  {
    type: 'principles',
    content: {
      title: 'Why This Works',
      principles: [
        {
          label: 'PRINCIPLE 1',
          title: 'Active Recall',
          desc: 'Testing yourself is more effective than re-reading. Each retrieval attempt strengthens memory pathways.',
          tip: 'In the tool: Students type answers, not just flip cards',
          color: '#8B5CF6'
        },
        {
          label: 'PRINCIPLE 2',
          title: 'Spaced Repetition',
          desc: 'Reviewing at increasing intervals combats the forgetting curve. Weak cards appear more often.',
          tip: 'In the tool: Learn mode tracks mastery automatically',
          color: '#F97316'
        },
        {
          label: 'PRINCIPLE 3',
          title: 'Desirable Difficulty',
          desc: 'Learning feels harder but lasts longer. Struggling to retrieve is where learning happens.',
          tip: 'In the tool: No hints until student attempts answer',
          color: '#EC4899'
        }
      ]
    }
  },
  // Slide 8: The Complete Workflow
  {
    type: 'workflow',
    content: {
      title: 'The Complete Workflow',
      teacherSteps: [
        { num: '1', title: 'Build Prompt', desc: '10-step wizard' },
        { num: '2', title: 'Copy to AI', desc: 'ChatGPT / Claude' },
        { num: '3', title: 'Paste Response', desc: 'Auto-parsed' },
        { num: '4', title: 'Get Link', desc: 'Share instantly', highlight: true }
      ],
      studentSteps: [
        { num: '1', title: 'Click Link', desc: 'No login needed' },
        { num: '2', title: 'Choose Mode', desc: 'Match / Learn / Test' },
        { num: '3', title: 'Study', desc: 'Active recall' },
        { num: '4', title: 'Master', desc: 'Track progress', highlight: true }
      ],
      benefits: [
        'No student accounts required',
        'Works on phones, tablets, laptops',
        'Free for Jersey schools'
      ]
    }
  },
  // Slide 9: Getting Started
  {
    type: 'getting-started',
    content: {
      title: 'Getting Started',
      documentation: {
        label: 'DOCUMENTATION',
        url: 'support.cshub.org.je',
        desc: 'Step-by-step guides for every feature, with screenshots and video walkthroughs.',
        guides: [
          'Creating your first deck',
          'Sharing with students',
          'Exporting to Anki / Quizlet',
          'SEND accessibility options'
        ]
      },
      quickStart: {
        title: 'Quick Start (5 minutes)',
        steps: [
          { title: 'Go to flashcards.cshub.org.je', desc: 'Works in any browser, no download needed' },
          { title: 'Complete the 10-step wizard', desc: 'Each step explains why it matters' },
          { title: 'Copy prompt → Paste to ChatGPT', desc: 'Or Claude, Copilot, Gemini – any AI chatbot' },
          { title: 'Paste the AI response back', desc: 'Tool auto-detects Q&A format' },
          { title: 'Share the link with students', desc: 'QR code, Teams, email – they just click', highlight: true }
        ]
      }
    }
  },
  // Slide 10: Your Turn
  {
    type: 'activity',
    content: {
      badge: 'HANDS-ON ACTIVITY',
      title: 'Your Turn!',
      subtitle: 'Create a flashcard deck for your subject',
      instructions: 'Pick a topic you\'re teaching next week. Use the prompt builder to create 10-15 flashcards. Share your link with a colleague.',
      time: 'Time: 10 minutes',
      url: 'flashcards.cshub.org.je'
    }
  },
  // Slide 11: Tips for Success
  {
    type: 'tips',
    content: {
      title: 'Tips for Success',
      dos: [
        { title: 'Be specific about exam board', desc: 'AQA, Edexcel, and OCR have different emphases' },
        { title: 'Include common misconceptions', desc: 'helps AI create cards that address typical errors' },
        { title: 'Mix question types', desc: 'recall, application, and analysis keeps students thinking' },
        { title: 'Review before sharing', desc: 'quick scan catches any AI errors' },
        { title: 'Start small', desc: '15 cards for one topic, then expand' }
      ],
      donts: [
        { title: 'Use vague prompts', desc: '"make flashcards about science" gets generic results' },
        { title: 'Skip the year group', desc: 'a Year 7 and Year 11 need different vocabulary levels' },
        { title: 'Create 50+ cards at once', desc: 'smaller decks = better focus per session' },
        { title: 'Assume AI is always right', desc: 'check dates, definitions, and edge cases' },
        { title: 'Forget accessibility', desc: 'SEND options help more students than you\'d expect' }
      ]
    }
  },
  // Slide 12: Thank You
  {
    type: 'thankyou',
    content: {
      title: 'Thank You',
      subtitle: 'Questions? Ideas? Let\'s talk!',
      links: [
        { label: 'CREATE FLASHCARDS', url: 'flashcards.cshub.org.je' },
        { label: 'SUPPORT', url: 'support.cshub.org.je' }
      ],
      author: 'Jose Galan'
    }
  }
]

function CPDPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      nextSlide()
    } else if (e.key === 'ArrowLeft') {
      prevSlide()
    } else if (e.key === 'Escape') {
      navigate('/')
    }
  }

  const renderSlide = (slide) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="slide slide-title">
            <span className="badge">{slide.content.badge}</span>
            <h1>{slide.content.title}</h1>
            <p className="subtitle">{slide.content.subtitle}</p>
            <div className="title-footer">
              <span className="author">{slide.content.author}</span>
              <span className="url">{slide.content.url}</span>
            </div>
          </div>
        )

      case 'overview':
        return (
          <div className="slide slide-overview">
            <h2>{slide.content.title}</h2>
            <span className="duration-badge">{slide.content.duration}</span>
            <div className="overview-items">
              {slide.content.items.map((item, i) => (
                <div key={i} className="overview-item">
                  <div className="item-number">{i + 1}</div>
                  <div className="item-content">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <span className="item-time">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'problem':
        return (
          <div className="slide slide-problem">
            <h2>{slide.content.title}</h2>
            <p className="slide-subtitle">{slide.content.subtitle}</p>
            <div className="problem-grid">
              {slide.content.problems.map((problem, i) => (
                <div key={i} className="problem-card">
                  <span className="problem-icon">{problem.icon}</span>
                  <h3>{problem.title}</h3>
                  <p>{problem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'solution':
        return (
          <div className="slide slide-solution">
            <h2>{slide.content.title}</h2>
            <p className="slide-subtitle">{slide.content.subtitle}</p>
            <div className="solution-grid">
              {slide.content.features.map((feature, i) => (
                <div key={i} className="solution-card">
                  <span className="solution-icon">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'demo':
        return (
          <div className="slide slide-demo">
            <span className="badge badge-orange">{slide.content.badge}</span>
            <h1>{slide.content.title}</h1>
            <p className="subtitle">{slide.content.subtitle}</p>
            <div className="demo-steps">
              {slide.content.steps.map((step, i) => (
                <div key={i} className={`demo-step ${step.active ? 'active' : ''}`}>
                  <div className="step-circle"></div>
                  <span>{step.label}</span>
                  {i < slide.content.steps.length - 1 && <div className="step-connector"></div>}
                </div>
              ))}
            </div>
          </div>
        )

      case 'modes':
        return (
          <div className="slide slide-modes">
            <h2>{slide.content.title}</h2>
            <p className="slide-subtitle">{slide.content.subtitle}</p>
            <div className="modes-grid">
              {slide.content.modes.map((mode, i) => (
                <div key={i} className="mode-card">
                  <div className="mode-icon" style={{ backgroundColor: mode.color }}></div>
                  <h3>{mode.title}</h3>
                  <p>{mode.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'principles':
        return (
          <div className="slide slide-principles">
            <h2>{slide.content.title}</h2>
            <div className="principles-grid">
              {slide.content.principles.map((principle, i) => (
                <div key={i} className="principle-card" style={{ '--accent-color': principle.color }}>
                  <span className="principle-label">{principle.label}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.desc}</p>
                  <div className="principle-tip">
                    <strong>In the tool:</strong> {principle.tip.replace('In the tool: ', '')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'workflow':
        return (
          <div className="slide slide-workflow">
            <h2>{slide.content.title}</h2>
            <div className="workflow-section">
              <div className="workflow-label teacher">Teacher</div>
              <div className="workflow-steps">
                {slide.content.teacherSteps.map((step, i) => (
                  <div key={i} className={`workflow-step ${step.highlight ? 'highlight' : ''}`}>
                    <div className="step-box">
                      <strong>{step.num}. {step.title}</strong>
                      <span>{step.desc}</span>
                    </div>
                    {i < slide.content.teacherSteps.length - 1 && <span className="arrow">→</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="workflow-arrow-down">↓</div>
            <div className="workflow-section">
              <div className="workflow-label student">Student</div>
              <div className="workflow-steps">
                {slide.content.studentSteps.map((step, i) => (
                  <div key={i} className={`workflow-step ${step.highlight ? 'highlight-green' : ''}`}>
                    <div className="step-box student-step">
                      <strong>{step.num}. {step.title}</strong>
                      <span>{step.desc}</span>
                    </div>
                    {i < slide.content.studentSteps.length - 1 && <span className="arrow orange">→</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="workflow-benefits">
              {slide.content.benefits.map((benefit, i) => (
                <span key={i} className="benefit">✓ {benefit}</span>
              ))}
            </div>
          </div>
        )

      case 'getting-started':
        return (
          <div className="slide slide-getting-started">
            <h2>{slide.content.title}</h2>
            <div className="getting-started-grid">
              <div className="docs-section">
                <span className="section-label">{slide.content.documentation.label}</span>
                <h3>{slide.content.documentation.url}</h3>
                <p>{slide.content.documentation.desc}</p>
                <div className="divider"></div>
                <span className="guides-label">Popular guides:</span>
                <ul>
                  {slide.content.documentation.guides.map((guide, i) => (
                    <li key={i}>{guide}</li>
                  ))}
                </ul>
              </div>
              <div className="quickstart-section">
                <h3>{slide.content.quickStart.title}</h3>
                <div className="quickstart-steps">
                  {slide.content.quickStart.steps.map((step, i) => (
                    <div key={i} className={`quickstart-step ${step.highlight ? 'highlight' : ''}`}>
                      <div className="step-indicator"></div>
                      <div className="step-content">
                        <strong>{step.title}</strong>
                        <span>{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'activity':
        return (
          <div className="slide slide-activity">
            <span className="badge">{slide.content.badge}</span>
            <h1>{slide.content.title}</h1>
            <p className="subtitle">{slide.content.subtitle}</p>
            <div className="activity-box">
              <p>{slide.content.instructions}</p>
              <div className="time-badge">{slide.content.time}</div>
            </div>
            <span className="activity-url">{slide.content.url}</span>
          </div>
        )

      case 'tips':
        return (
          <div className="slide slide-tips">
            <h2>{slide.content.title}</h2>
            <div className="tips-grid">
              <div className="tips-column do">
                <div className="tips-header">✓ Do</div>
                {slide.content.dos.map((tip, i) => (
                  <div key={i} className="tip-item">
                    <strong>{tip.title}</strong> – {tip.desc}
                  </div>
                ))}
              </div>
              <div className="tips-column dont">
                <div className="tips-header">✗ Don't</div>
                {slide.content.donts.map((tip, i) => (
                  <div key={i} className="tip-item">
                    <strong>{tip.title}</strong> – {tip.desc}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'thankyou':
        return (
          <div className="slide slide-thankyou">
            <h1>{slide.content.title}</h1>
            <p className="subtitle">{slide.content.subtitle}</p>
            <div className="links-box">
              {slide.content.links.map((link, i) => (
                <div key={i} className="link-item">
                  <span className="link-label">{link.label}</span>
                  <strong>{link.url}</strong>
                </div>
              ))}
            </div>
            <span className="author">{slide.content.author}</span>
          </div>
        )

      default:
        return <div className="slide">Unknown slide type</div>
    }
  }

  return (
    <div
      className="cpd-presentation"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="slide-container">
        {renderSlide(slides[currentSlide])}
      </div>

      <div className="presentation-controls">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="nav-button"
        >
          ← Previous
        </button>

        <div className="slide-indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`indicator ${i === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="nav-button"
        >
          Next →
        </button>
      </div>

      <div className="slide-counter">
        {currentSlide + 1} / {slides.length}
      </div>

      <button className="exit-button" onClick={() => navigate('/')}>
        ✕
      </button>
    </div>
  )
}

export default CPDPresentation
