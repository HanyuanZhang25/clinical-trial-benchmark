import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

function MySubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getMySubmissions()
      .then(({ submissions: rows }) => setSubmissions(rows))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-card">Loading your submission history...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="page-shell">
      <div className="section-header">
        <p className="eyebrow">History</p>
        <h1 className="page-title">My submissions</h1>
        <p>Only the most recent 50 results are shown here.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <p>You have not submitted any benchmark runs yet.</p>
          <Link to="/submit" className="btn btn-primary">Go to Submission Flow</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Benchmark</th>
                <th>Submitted At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.benchmark_name}</td>
                  <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                  <td><span className="pill">{submission.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MySubmissions
