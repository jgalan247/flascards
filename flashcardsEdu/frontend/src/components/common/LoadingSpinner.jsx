import './LoadingSpinner.css'

function LoadingSpinner({ message = 'Loading...', size = 'medium', fullPage = false }) {
  const spinnerClass = `spinner spinner-${size}`

  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className={spinnerClass}></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    )
  }

  return (
    <div className="loading-inline">
      <div className={spinnerClass}></div>
      {message && <span className="loading-message">{message}</span>}
    </div>
  )
}

export default LoadingSpinner
