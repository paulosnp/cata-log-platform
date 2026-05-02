import './App.css'
import logo from './assets/logo.svg'

function App() {
  return (
    <div className="status-page">
      <div className="status-card">
        <div className="logo-container">
          <img src={logo} alt="Cata Log" className="logo-image" />
        </div>

        <hr className="divider" />

        <div className="status-badge">
          <span className="status-dot" />
          Estou Online!
        </div>

        <p className="status-title">Front-end operacional</p>
        <p className="status-subtitle">
          A aplicação está rodando e pronta para receber atualizações.
        </p>
      </div>

      <p className="footer-info">Cata Log Platform &bull; v0.1.4</p>
    </div>
  )
}

export default App
