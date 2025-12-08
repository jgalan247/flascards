import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import api from './utils/api'

// Teacher components
import Login from './components/teacher/Login'
import Dashboard from './components/teacher/Dashboard'
import PromptBuilder from './components/teacher/PromptBuilder'
import DeckManager from './components/teacher/DeckManager'

// Student components
import DeckLanding from './components/student/DeckLanding'
import Flashcards from './components/student/Flashcards'
import MatchGame from './components/student/MatchGame'
import LearnMode from './components/student/LearnMode'
import TestMode from './components/student/TestMode'
import GravityGame from './components/student/GravityGame'

// Public components
import CPDPresentation from './components/CPDPresentation'

function App() {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me/')
      setTeacher(response.data)
    } catch (error) {
      setTeacher(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (teacherData) => {
    setTeacher(teacherData)
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/')
      setTeacher(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Teacher routes */}
          <Route
            path="/"
            element={
              teacher ? (
                <Dashboard teacher={teacher} onLogout={handleLogout} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/create"
            element={
              teacher ? (
                <PromptBuilder teacher={teacher} onLogout={handleLogout} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/deck/:slug/edit"
            element={
              teacher ? (
                <DeckManager teacher={teacher} onLogout={handleLogout} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/* Student routes (no auth required) */}
          <Route path="/study/:slug" element={<DeckLanding />} />
          <Route path="/study/:slug/flashcards" element={<Flashcards />} />
          <Route path="/study/:slug/match" element={<MatchGame />} />
          <Route path="/study/:slug/learn" element={<LearnMode />} />
          <Route path="/study/:slug/test" element={<TestMode />} />
          <Route path="/study/:slug/gravity" element={<GravityGame />} />

          {/* Public pages */}
          <Route path="/cpd" element={<CPDPresentation />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
