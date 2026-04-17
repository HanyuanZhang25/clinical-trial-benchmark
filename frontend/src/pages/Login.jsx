import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user } = await api.login(email, password)
      onLogin(user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <p className="eyebrow">Sign In</p>
        <h1 className="page-title">Welcome back</h1>
        <p className="page-subtitle">Use your Clinical Trial Arena account to view benchmark history and submit new runs.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-link">
          Need an account? <Link to="/register">Create one</Link>
        </div>
        <div className="auth-link">
          Forgot your password? <Link to="/reset-password">Reset it</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
