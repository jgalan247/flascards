import { useState } from 'react'
import api from '../../utils/api'
import './Login.css'

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register/' : '/auth/login/'
      const response = await api.post(endpoint, formData)
      onLogin(response.data.teacher)
    } catch (err) {
      const data = err.response?.data
      if (data) {
        // Handle DRF validation errors (field-specific errors)
        if (typeof data === 'object' && !data.error) {
          const messages = Object.entries(data)
            .map(([field, errors]) => {
              const errorList = Array.isArray(errors) ? errors : [errors]
              return errorList.join(' ')
            })
            .join(' ')
          setError(messages || 'Validation failed')
        } else {
          setError(data.error || 'An error occurred')
        }
      } else {
        setError('An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <p className="school-name">Le Rocquier School <span className="powered-by">Powered by AI</span></p>
          <h1>Flashcard Generator</h1>
          <p className="tagline">Learn. Revise. Succeed.</p>
          <p>Create AI-powered flashcards for your students</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required={isRegister}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
            />
            {isRegister && (
              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)</li>
                </ul>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <p className="toggle-auth">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="btn-link"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign In' : 'Create one'}
            </button>
          </p>

          {!isRegister && (
            <p className="forgot-password">
              Forgot your password? Contact your administrator.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
