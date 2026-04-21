import React from 'react'
import contactEmailImage from '../assets/contact-email.jpg'

function Contact() {
  return (
    <div className="page-shell">
      <div className="section-header">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title">Contact</h1>
      </div>

      <div className="card contact-page-card">
        <p>The contact email is as following, you can use it to contact with us.</p>
        <div className="contact-email-image-frame">
          <img
            src={contactEmailImage}
            alt="Contact email: ctopenchallenge@gmail.com"
            className="contact-email-image"
          />
        </div>
      </div>
    </div>
  )
}

export default Contact
