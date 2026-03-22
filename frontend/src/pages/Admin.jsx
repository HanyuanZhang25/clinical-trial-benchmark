import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'

function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getStats(), api.getUsers()])
      .then(([statsResponse, usersResponse]) => {
        setStats(statsResponse.stats)
        setUsers(usersResponse.users)
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
    </div>
  )
}

export default Admin
