import React from 'react'

function renderInlineText(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    }

    return part
  })
}

function ContentSections({ sections = [] }) {
  return (
    <>
      {sections.map((section) => (
        <section className="content-section" key={section.heading}>
          <h3>{section.heading}</h3>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{renderInlineText(paragraph)}</p>
          ))}
          {section.items && (
            <ul>
              {section.items.map((item) => (
                <li key={item}>{renderInlineText(item)}</li>
              ))}
            </ul>
          )}
          {section.table && (
            <div className="content-table-shell">
              <table className="content-table">
                <thead>
                  <tr>
                    {section.table.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row) => (
                    <tr key={row.join('-')}>
                      {row.map((cell) => (
                        <td key={cell}>{renderInlineText(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </>
  )
}

export default ContentSections
