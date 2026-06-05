import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ContentSections from '../components/ContentSections'
import { api } from '../utils/api'

const DISPLAY_TIME_ZONE = 'America/Los_Angeles'
const VISION_VIDEO_URL = 'https://youtu.be/VbEtRQVCb0Q?si=Wlycd3QBDHLfexH3'
const CHALLENGE_WINDOW_LABELS = {
  '26-06': 'June-August 2026',
  '26-09': 'September-December 2026',
}

function formatMetric(value, digits = 2) {
  return typeof value === 'number' ? value.toFixed(digits) : '-'
}

function formatLongCountdown(dateString, currentTime = Date.now()) {
  const target = Date.parse(dateString)
  if (Number.isNaN(target)) return ''

  const diff = target - currentTime
  if (diff <= 0) return '00 weeks 00 days 00:00:00'

  const totalSeconds = Math.floor(diff / 1000)
  const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60))
  const days = Math.floor((totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return `${String(weeks).padStart(2, '0')} weeks ${String(days).padStart(2, '0')} days ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatDate(dateString) {
  if (!dateString) return 'TBD'

  const value = Date.parse(dateString)
  if (Number.isNaN(value)) return 'TBD'

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: DISPLAY_TIME_ZONE,
  })
}

function formatWindow(openAt, closeAt) {
  const openValue = Date.parse(openAt)
  const closeValue = Date.parse(closeAt)
  if (Number.isNaN(openValue) || Number.isNaN(closeValue)) return 'TBD'

  const openDate = new Date(openValue)
  const closeDate = new Date(closeValue)
  const openMonth = openDate.toLocaleString('en-US', { month: 'long', timeZone: DISPLAY_TIME_ZONE })
  const closeMonth = closeDate.toLocaleString('en-US', { month: 'long', timeZone: DISPLAY_TIME_ZONE })
  const closeYear = closeDate.toLocaleString('en-US', { year: 'numeric', timeZone: DISPLAY_TIME_ZONE })

  return openMonth === closeMonth
    ? `${openMonth} ${closeYear}`
    : `${openMonth}-${closeMonth} ${closeYear}`
}

function getChallengeWindowLabel(benchmark) {
  return CHALLENGE_WINDOW_LABELS[benchmark.slug]
    || formatWindow(benchmark.submission_open_at, benchmark.submission_close_at)
}

function getScheduleStatusLabel(state) {
  switch (state) {
    case 'open_for_submission':
      return 'Accepting Submission'
    case 'upcoming':
      return 'Upcoming'
    case 'closed_pending_results':
      return 'Closed Pending Results'
    case 'results_published':
      return 'Results Published'
    case 'archived':
      return 'Archived'
    default:
      return 'Scheduled'
  }
}

function getBenchmarkTabStatusLabel(benchmark) {
  if (benchmark.is_result_published) return 'Leaderboard'
  if (benchmark.is_submission_open) return 'Accepting Submission'
  if (benchmark.state === 'closed_pending_results') return 'Closed Pending Results'

  return ''
}

const METRIC_GROUPS = [
  {
    key: 'endpoint',
    label: 'Endpoint',
    columns: [
      { key: 'endpoint_macro_f1', label: 'Macro-F1' },
      { key: 'endpoint_balanced_accuracy', label: 'Balanced Accuracy' },
    ],
  },
  {
    key: 'superiority',
    label: 'Superiority',
    columns: [
      { key: 'superiority_macro_f1', label: 'Macro-F1' },
      { key: 'superiority_balanced_accuracy', label: 'Balanced Accuracy' },
    ],
  },
  {
    key: 'comparative_effect',
    label: 'Comparative Effect',
    columns: [
      { key: 'comparative_effect_macro_f1', label: 'Macro-F1' },
      { key: 'comparative_effect_balanced_accuracy', label: 'Balanced Accuracy' },
    ],
  },
]

function PublishedBenchmarkTable({ benchmark, rows }) {
  const useUsernameIdentity = Number(benchmark.id) > 2
  const showHistoricalLayout = ['25-02', '25-09'].includes(benchmark.slug)
  const displayedRows = rows
  const showContaminationNote = showHistoricalLayout

  function renderModelLabel(row) {
    const label = useUsernameIdentity ? row.username : (showHistoricalLayout ? row.username : row.model)
    const flaggedModel = ['Claude Opus 4.5', 'Claude Opus 4.5 + RAG'].includes(row.username)

    return (
      <>
        <strong>{label}</strong>
        {flaggedModel && <span className="contamination-flag" aria-label="Potential contamination">!</span>}
      </>
    )
  }

  return (
    <div className={`table-container ${showHistoricalLayout ? 'historical-table-shell' : ''}`}>
      <table className={showHistoricalLayout ? 'historical-results-table' : ''}>
        {showHistoricalLayout && (
          <colgroup>
            <col className="historical-col-model" />
            <col className="historical-col-metric" />
            <col className="historical-col-metric" />
            <col className="historical-col-metric" />
            <col className="historical-col-metric" />
            <col className="historical-col-metric" />
            <col className="historical-col-metric" />
          </colgroup>
        )}
        <thead>
          <tr>
            <th rowSpan="2">{useUsernameIdentity ? 'Username' : 'Model'}</th>
            {METRIC_GROUPS.map((group) => (
              <th key={group.key} colSpan={group.columns.length}>
                {group.label}
              </th>
            ))}
          </tr>
          <tr>
            {METRIC_GROUPS.flatMap((group) =>
              group.columns.map((column) => (
                <th key={`${group.key}-${column.key}`}>{column.label}</th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row, index) => {
            if (row.is_section_header) {
              return (
                <tr key={`section-${benchmark.slug}-${index}`} className="historical-section-row">
                  <td colSpan={1 + METRIC_GROUPS.reduce((total, group) => total + group.columns.length, 0)}>
                    <em>{row.model}</em>
                  </td>
                </tr>
              )
            }

            return (
              <tr key={`${benchmark.slug}-${index}`} className={showHistoricalLayout ? 'historical-data-row' : ''}>
                <td className={showHistoricalLayout ? 'historical-model-cell' : ''}>
                  {renderModelLabel(row)}
                  {!useUsernameIdentity && !showHistoricalLayout && row.username && (
                    <div className="table-subtext">{row.username}</div>
                  )}
                </td>
                {METRIC_GROUPS.flatMap((group) =>
                  group.columns.map((column) => (
                    <td
                      key={`${benchmark.slug}-${index}-${column.key}`}
                      className={showHistoricalLayout ? 'historical-metric-cell' : ''}
                    >
                      {formatMetric(row[column.key], column.digits ?? 2)}
                    </td>
                  ))
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {showContaminationNote && (
        <div className="historical-note">
          <span className="contamination-flag" aria-hidden="true">!</span>{' '}
          Results marked with an asterisk may be contaminated because these model variants were released after the historical submission cutoff, so their training data or system updates may have included knowledge of trial outcomes that were not available to participants at submission time.
        </div>
      )}
    </div>
  )
}

function OpenBenchmarkPanel({ benchmark, user }) {
  const deadlineLabel = formatDate(benchmark.submission_close_at)
  const isSubmissionOpen = benchmark.is_submission_open
  const isUpcoming = benchmark.state === 'upcoming'
  const submissionStatus = isSubmissionOpen
    ? `Actively accepting submissions. The submission deadline is ${deadlineLabel}.`
    : isUpcoming
      ? `Submissions are not open yet. The submission deadline is ${deadlineLabel}.`
      : `Stop accepting submissions. The submission deadline is ${deadlineLabel}.`
  const inactiveMessage = isUpcoming
    ? 'The submission window is not open yet. Benchmark files remain available for download.'
    : 'The submission window is closed. Benchmark files remain available for download.'

  return (
    <div className="open-benchmark-panel">
      <p className="eyebrow">{submissionStatus}</p>
      <h2>{benchmark.display_name}</h2>
      <p>
        {isSubmissionOpen
          ? `We are actively seeking submissions for ${benchmark.display_name}. Download the benchmark questions, submit your predictions for each question, and upload a JSON file according to our formatting rules.`
          : `The submission window for ${benchmark.display_name} is not currently open. Benchmark questions remain available for download.`}
      </p>
      <p>
        Auxiliary information is also available as trial metadata keyed by NCT ID. Participants may
        use that file to support their models on this benchmark.
      </p>

      <div className="cta-row">
        <a className="btn btn-secondary" href={api.getDownloadUrl(benchmark.id)}>
          Download the Benchmark Questions
        </a>
        <a className="btn btn-secondary" href={api.getAuxiliaryUrl(benchmark.id)}>
          Auxiliary Information
        </a>
        {isSubmissionOpen && (
          <Link className="btn btn-primary" to="/submit">
            Ready to Submit?
          </Link>
        )}
      </div>

      {!isSubmissionOpen && (
        <div className="callout">
          {inactiveMessage}
        </div>
      )}

      {isSubmissionOpen && !user && (
        <div className="callout callout-warning">
          Please log in and submit. We only accept submissions from authenticated users.
        </div>
      )}

      {isSubmissionOpen && user && !user.email_verified && (
        <div className="callout callout-warning">
          Your account is signed in, but email verification is still required before submissions are accepted.
          <Link to="/verify-email"> Complete verification</Link>.
        </div>
      )}

      {isSubmissionOpen && Boolean(user?.email_verified) && (
        <div className="callout callout-success">
          Your account is verified. You can download the file above and submit through the benchmark upload flow.
        </div>
      )}
    </div>
  )
}

function Home({ user }) {
  const [benchmarks, setBenchmarks] = useState([])
  const [leaderboards, setLeaderboards] = useState({})
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(null)
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [{ benchmarks: benchmarkRows }, { content: siteContent }] = await Promise.all([
          api.getBenchmarks(),
          api.getHomeContent(),
        ])

        setBenchmarks(benchmarkRows)
        setContent(siteContent)
        setActiveTab(benchmarkRows[0]?.id ?? null)

        const published = benchmarkRows.filter((item) => item.is_result_published)
        const leaderboardEntries = await Promise.all(
          published.map(async (item) => [item.id, await api.getBenchmarkLeaderboard(item.id)])
        )
        setLeaderboards(Object.fromEntries(leaderboardEntries))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const activeBenchmark = useMemo(
    () => benchmarks.find((item) => item.id === activeTab) || benchmarks[0],
    [benchmarks, activeTab]
  )

  const scheduleRows = useMemo(
    () =>
      benchmarks.map((benchmark) => ({
        id: benchmark.id,
        challenge: benchmark.display_name,
        window: getChallengeWindowLabel(benchmark),
        deadline: formatDate(benchmark.submission_close_at),
        deadlineDate: benchmark.submission_close_at,
        release: formatDate(benchmark.result_publish_at),
        status: getScheduleStatusLabel(benchmark.state),
        isLive: benchmark.state === 'open_for_submission',
      })),
    [benchmarks]
  )

  if (loading) return <div className="loading-card">Loading benchmark data...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1>CT Open Challenge</h1>
          <p>
            An Open-Access, Uncontaminated, Live Platform for the Open Challenge of Clinical Trial Outcome Prediction.
          </p>
          {content?.announcement?.items?.length > 0 && (
            <div className="notice-board top-gap">
              {content.announcement.items.map((item) => (
                <div key={item.date} className="notice-line">
                  <span className="notice-icon" aria-hidden="true">*</span>
                  <div>
                    <strong>New ({item.date}): </strong>
                    {item.parts.map((part, index) =>
                      part.type === 'link' ? (
                        <a key={`${item.date}-${index}`} href={part.href}>
                          {part.label}
                        </a>
                      ) : (
                        <span key={`${item.date}-${index}`}>{part.value}</span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="vision-video-section" aria-labelledby="vision-video-heading">
        <div className="section-header">
          <h2 id="vision-video-heading">CT Open Vision</h2>
        </div>
        <a
          className="btn btn-primary vision-video-link"
          href={VISION_VIDEO_URL}
          target="_blank"
          rel="noreferrer"
        >
          Watch on YouTube
        </a>
      </section>

      <section className="info-section">
        <div className="section-header">
          <h2>Schedule</h2>
        </div>
        <div className="card">
          <div className="table-container schedule-table-shell">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Window</th>
                  <th>Submission Deadline (Los Angeles Time)</th>
                  <th>Leaderboard Release (Los Angeles Time)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.challenge}</td>
                    <td>{row.window}</td>
                    <td>
                      <div>{row.deadline}</div>
                      {row.isLive && row.deadlineDate && (
                        <small className="schedule-countdown">
                          {formatLongCountdown(row.deadlineDate, currentTime)}
                        </small>
                      )}
                    </td>
                    <td>
                      <div>{row.release}</div>
                    </td>
                    <td>
                      <span className={row.isLive ? 'schedule-status-live' : 'schedule-status-upcoming'}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="benchmark-section">
        <div className="benchmark-tabs">
          {benchmarks.map((benchmark) => {
            const tabStatusLabel = getBenchmarkTabStatusLabel(benchmark)

            return (
              <button
                type="button"
                key={benchmark.id}
                className={`benchmark-tab ${activeBenchmark?.id === benchmark.id ? 'active' : ''}`}
                onClick={() => setActiveTab(benchmark.id)}
              >
                <span>{benchmark.display_name}</span>
                {tabStatusLabel && <small>{tabStatusLabel}</small>}
              </button>
            )
          })}
        </div>

        {activeBenchmark?.is_result_published ? (
          <div className="benchmark-panel">
            <div className="panel-header">
              <div>
                <h2>{activeBenchmark.display_name} Leaderboard</h2>
              </div>
            </div>
            <PublishedBenchmarkTable benchmark={activeBenchmark} rows={leaderboards[activeBenchmark.id]?.leaderboard || []} />
          </div>
        ) : (
          <div className="benchmark-panel">
            <OpenBenchmarkPanel benchmark={activeBenchmark} user={user} />
          </div>
        )}
      </section>

      {content && (
        <>
          <section className="info-section">
            <div className="section-header">
              <h2>{content.introduction.title}</h2>
            </div>
            <div className="card prose-card">
              {content.introduction.sections
                ? <ContentSections sections={content.introduction.sections} />
                : <p>{content.introduction.paragraphs.join(' ')}</p>}
              {content.introduction.links
                .filter((link) => /report|pdf/i.test(link.label))
                .map((link) => (
                  <div key={link.label} className="button-row top-gap">
                    <a className="btn btn-secondary" href={link.href}>
                      {link.label}
                    </a>
                  </div>
                ))}
            </div>
          </section>

        </>
      )}
    </div>
  )
}

export default Home
