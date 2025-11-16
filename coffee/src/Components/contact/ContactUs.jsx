import React from 'react';

const ContactUs = () => {
  return (
    <div className="contactus-container">
      <h1>Contact Us</h1>
      <div className="contactus-content">
        <p>
          We'd love to hear from you! Whether you have questions about coffee, feedback, or partnership inquiries, reach out to us using the details below.
        </p>
        <div className="contactus-methods">
          <div className="contactus-method">
            <h2>WhatsApp</h2>
            <p>
              Chat with us directly on WhatsApp for quick responses.<br />
              <a
                href="https://wa.me/yourwhatsappphonenumber"
                target="_blank"
                rel="noopener noreferrer"
                className="contactus-link"
              >
                Message us on WhatsApp
              </a>
            </p>
          </div>
          <div className="contactus-method">
            <h2>Email</h2>
            <p>
              For detailed inquiries, email us at:<br />
              <a
                href="mailto:jigishaflamings336@gmail.com"
                className="contactus-link"
              >
                jigishaflamings336@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;