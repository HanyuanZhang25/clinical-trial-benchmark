import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Submit from './pages/Submit'
import MySubmissions from './pages/MySubmissions'
import SubmissionDetail from './pages/SubmissionDetail'
import About from './pages/About'
import Admin from './pages/Admin'
import { api } from './utils/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProfile()
      .then(({ user: profile }) => setUser(profile))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await api.logout().catch(() => {})
    setUser(null)
  }

  if (loading) {
    return <div className="page-shell"><div className="loading-card">Loading Clinical Trial Arena...</div></div>
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register onLogin={setUser} />} />
            <Route path="/verify-email" element={user ? <VerifyEmail user={user} onVerified={setUser} /> : <Navigate to="/login" />} />
            <Route path="/submit" element={user ? <Submit user={user} /> : <Navigate to="/login" />} />
            <Route path="/my-submissions" element={user ? <MySubmissions /> : <Navigate to="/login" />} />
            <Route path="/submission/:id" element={user ? <SubmissionDetail /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
