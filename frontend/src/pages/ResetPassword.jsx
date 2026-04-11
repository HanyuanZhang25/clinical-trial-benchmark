import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

function ResetPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleRequestCode(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const response = await api.requestPasswordReset(email)
      setMessage(response.message)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const response = await api.verifyPasswordResetCode(email, code)
      setResetToken(response.reset_token)
      setMessage(response.message)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmPassword(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const response = await api.confirmPasswordReset(resetToken, password, confirmPassword)
      setMessage(response.message)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <p className="eyebrow">Password Reset</p>
        <h1 className="page-title">Reset your password</h1>
        <p className="page-subtitle">
          Enter your sign-up email, verify the code we send, then choose a new password.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestCode}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
              {loading ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label>Email</label>
              <input value={email} disabled />
            </div>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
              {loading ? 'Checking code...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleConfirmPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Repeat New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
              {loading ? 'Updating password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-link">
          Back to <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
