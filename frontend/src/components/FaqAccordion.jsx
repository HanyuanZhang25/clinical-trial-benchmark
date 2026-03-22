import React, { useState } from 'react'

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div className={`faq-item ${isOpen ? 'open' : ''}`} key={item.question}>
            <button
              type="button"
              className="faq-trigger"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span>{item.question}</span>
              <span className="faq-symbol">{isOpen ? '×' : '+'}</span>
            </button>
            {isOpen && <div className="faq-answer">{item.answer}</div>}
          </div>
        )
      })}
    </div>
  )
}

export default FaqAccordion
