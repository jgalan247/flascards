import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import './Login.css'

function VerifyEmail({ onLogin }) {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [error, setError] = useState('')

  useEffect(() => {
    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await api.post('/auth/verify/', { token })
      setStatus('success')
      // Auto-login after verification
      setTimeout(() => {
        onLogin(response.data.teacher)
        navigate('/')
      }, 2000)
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.error || 'Verification failed')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Flashcard Generator</h1>
          <p>Email Verification</p>
        </div>

        <div className="verify-sent">
          {status === 'verifying' && (
            <>
              <div className="verify-icon">⏳</div>
              <h2>Verifying your email...</h2>
              <p>Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="verify-icon">✅</div>
              <h2>Email Verified!</h2>
              <p>Your account is now active. Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="verify-icon">❌</div>
              <h2>Verification Failed</h2>
              <p>{error}</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/')}
                style={{ marginTop: '20px' }}
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
