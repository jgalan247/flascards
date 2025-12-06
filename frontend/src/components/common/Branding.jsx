import './Branding.css'

function Branding({ light = false }) {
  return (
    <div className={`branding ${light ? 'branding-light' : ''}`}>
      <p className="school-name">Le Rocquier School <span className="powered-by">Powered by AI</span></p>
      <p className="tagline">Learn. Revise. Succeed.</p>
    </div>
  )
}

export default Branding
