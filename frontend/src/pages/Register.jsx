import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function Register({ onLogin }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    affiliation: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const usernameError = form.username.length > 50 ? 'Username must be 50 characters or fewer.' : null
  const passwordError = form.password && (form.password.length < 6 || form.password.length > 16)
    ? 'Password must be between 6 and 16 characters.'
    : null
  const emailError = form.email && !isValidEmail(form.email)
    ? 'Please enter a valid email address.'
    : null

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (usernameError || passwordError || emailError) {
      setError(usernameError || passwordError || emailError)
      return
    }

    setLoading(true)

    try {
      const { user } = await api.register(form)
      onLogin(user)
      navigate('/verify-email')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <p className="eyebrow">Create Account</p>
        <h1 className="page-title">Join Clinical Trial Arena</h1>
        <p className="page-subtitle">Register once, verify your email, and use the same account across benchmark releases.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={(e) => update('username', e.target.value)} maxLength={50} required />
            {usernameError && <small className="form-hint error-text">{usernameError}</small>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={6} maxLength={16} required />
            {passwordError && <small className="form-hint error-text">{passwordError}</small>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            {emailError && <small className="form-hint error-text">{emailError}</small>}
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Company or University Name</label>
            <input value={form.affiliation} onChange={(e) => update('affiliation', e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-link">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
