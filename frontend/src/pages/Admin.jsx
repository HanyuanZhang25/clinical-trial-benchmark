import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getStats(), api.getUsers(), api.getAdminSubmissions()])
      .then(([statsResponse, usersResponse, submissionsResponse]) => {
        setStats(statsResponse.stats)
        setUsers(usersResponse.users)
        setSubmissions(submissionsResponse.submissions)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="alert alert-error">{error}</div>
  if (!stats) return <div className="loading-card">Loading admin data...</div>

  return (
    <div className="page-shell">
      <div className="section-header">
        <p className="eyebrow">Admin</p>
        <h1 className="page-title">Platform overview</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><strong>{stats.users}</strong><span>Users</span></div>
        <div className="stat-card"><strong>{stats.benchmarks}</strong><span>Benchmarks</span></div>
        <div className="stat-card"><strong>{stats.submissions}</strong><span>Submissions</span></div>
        <div className="stat-card"><strong>{stats.pending_evaluations}</strong><span>Pending evaluations</span></div>
      </div>

      <div className="table-container top-gap">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Affiliation</th>
              <th>Verified</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>{user.affiliation}</td>
                <td>{user.email_verified ? 'Yes' : 'No'}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header top-gap">
        <p className="eyebrow">Admin</p>
        <h2 className="section-title">All Submission Results</h2>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Benchmark</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Avg F1</th>
              <th>Avg CE</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.id}</td>
                <td>{submission.username}</td>
                <td>{submission.email}</td>
                <td>{submission.benchmark_name}</td>
                <td>{submission.status}</td>
                <td>{typeof submission.total_cost === 'number' ? submission.total_cost.toFixed(2) : '-'}</td>
                <td>{typeof submission.average_f1_macro === 'number' ? submission.average_f1_macro.toFixed(3) : '-'}</td>
                <td>{typeof submission.average_cross_entropy === 'number' ? submission.average_cross_entropy.toFixed(3) : '-'}</td>
                <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                <td>
                  <Link to={`/submission/${submission.id}?from=admin`} className="btn btn-secondary compact-btn">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!submissions.length && (
              <tr>
                <td colSpan="10">No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Admin
