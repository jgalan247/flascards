import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import './Login.css'

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('form') // form, success, error
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password/', { token, password })
      setStatus('success')
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Flashcard Generator</h1>
          <p>Reset Password</p>
        </div>

        {status === 'form' && (
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Create New Password</h2>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className="verify-sent">
            <div className="verify-icon">✅</div>
            <h2>Password Reset!</h2>
            <p>Your password has been successfully updated.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
              style={{ marginTop: '20px' }}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
