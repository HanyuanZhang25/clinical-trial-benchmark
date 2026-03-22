import React, { useState } from 'react'
import { api } from '../utils/api'

function VerifyEmail({ user, onVerified }) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleVerify(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const { user: verifiedUser, message: responseMessage } = await api.verifyEmail(code)
      onVerified(verifiedUser)
      setMessage(responseMessage)
      setCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(null)
    setMessage(null)
    try {
      const response = await api.resendVerification()
      setMessage(response.message)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <p className="eyebrow">Email Verification</p>
        <h1 className="page-title">Verify {user.email}</h1>
        <p className="page-subtitle">
          In this MVP, verification codes are logged to the backend development console instead of being emailed.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Verification Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <button type="button" className="btn btn-secondary full-width top-gap" onClick={handleResend}>
          Resend Code
        </button>
      </div>
    </div>
  )
}

export default VerifyEmail
