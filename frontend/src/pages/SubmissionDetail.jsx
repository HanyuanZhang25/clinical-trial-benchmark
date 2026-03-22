import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../utils/api'

function formatMetric(value) {
  return typeof value === 'number' ? value.toFixed(3) : '-'
}

function SubmissionDetail() {
  const { id } = useParams()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getSubmission(id)
      .then(({ submission: row }) => setSubmission(row))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-card">Loading submission details...</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!submission) return <div className="alert alert-error">Submission not found.</div>

  return (
    <div className="page-shell">
      <Link to="/my-submissions" className="btn btn-secondary compact-btn">
        Back to My Submissions
      </Link>

      <div className="section-header top-gap">
        <p className="eyebrow">{submission.benchmark_name}</p>
        <h1 className="page-title">Submission #{submission.id}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <strong>{submission.status.replaceAll('_', ' ')}</strong>
          <span>Status</span>
        </div>
        <div className="stat-card">
          <strong>{submission.total_cost.toFixed(2)}</strong>
          <span>Total Cost</span>
        </div>
        <div className="stat-card">
          <strong>{formatMetric(submission.evaluation.average_f1_macro)}</strong>
          <span>Average F1 Macro</span>
        </div>
        <div className="stat-card">
          <strong>{formatMetric(submission.evaluation.average_cross_entropy)}</strong>
          <span>Average Cross Entropy</span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h2 className="section-title">Validation Summary</h2>
          <p>Accepted answers: {submission.validation_summary?.answerCount ?? '-'}</p>
          <p>Manifest count: {submission.validation_summary?.manifestCount ?? '-'}</p>
          <p>Missing IDs: {submission.validation_summary?.missingIds?.length ? submission.validation_summary.missingIds.join(', ') : 'None'}</p>
        </div>

        <div className="card">
          <h2 className="section-title">Metric Snapshot</h2>
          <p>Arm2Arm Superiority F1: {formatMetric(submission.evaluation.arm2arm_superiority_f1)}</p>
          <p>Arm2Arm Superiority Cross Entropy: {formatMetric(submission.evaluation.arm2arm_superiority_cross_entropy)}</p>
          <p>Arm2Arm Non-Inferiority F1: {formatMetric(submission.evaluation.arm2arm_noninferiority_f1)}</p>
          <p>Arm2Arm Non-Inferiority Cross Entropy: {formatMetric(submission.evaluation.arm2arm_noninferiority_cross_entropy)}</p>
          <p>Endpoint Prediction F1: {formatMetric(submission.evaluation.endpoint_prediction_f1)}</p>
          <p>Endpoint Prediction Cross Entropy: {formatMetric(submission.evaluation.endpoint_prediction_cross_entropy)}</p>
        </div>
      </div>

      <div className="card top-gap">
        <h2 className="section-title">Submitted Payload</h2>
        <pre className="code-block">{JSON.stringify(submission.raw_payload, null, 2)}</pre>
      </div>
    </div>
  )
}

export default SubmissionDetail
