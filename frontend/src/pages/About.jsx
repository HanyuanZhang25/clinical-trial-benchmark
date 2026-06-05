import React, { useEffect, useState } from 'react'
import ContentSections from '../components/ContentSections'
import FaqAccordion from '../components/FaqAccordion'
import { api } from '../utils/api'

function About() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getHomeContent()
      .then(({ content: row }) => setContent(row))
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="alert alert-error">{error}</div>
  if (!content) return <div className="loading-card">Loading instructions...</div>

  const introduction = content.instructionsIntroduction || content.introduction

  return (
    <div className="page-shell">
      <div className="section-header">
        <h1 className="page-title">{introduction.title}</h1>
      </div>
      <div className="card prose-card">
        {introduction.sections
          ? <ContentSections sections={introduction.sections} />
          : introduction.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      </div>

      <section className="info-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        <FaqAccordion items={content.faq} />
      </section>
    </div>
  )
}

export default About
