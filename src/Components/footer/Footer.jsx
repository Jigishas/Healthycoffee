import React, { useState } from 'react';
import './footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <h2>Coffee Plantation</h2>
          <p>
            Brewed with passion. Sharing knowledge about coffee cultivation, harvesting, and processing.<br />
            <span className="footer-quote">"Life begins after coffee."</span>
          </p>
        </div>
        
        <div>
          <h3>Quick Links</h3>
          <div className="footer-links">
            <a href="#faq">FAQs</a>
            <a href="#askme">Ask Me</a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
        
        <div>
          <h3>Legal</h3>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
        
        <div>
          <h3>Subscribe</h3>
          <form className="footer-subscribe" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="footer-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={subscribed}
              required
            />
            <button 
              className="footer-button" 
              type="submit"
              disabled={subscribed}
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
          {subscribed && (
            <div className="footer-success">
              Thank you for subscribing!
            </div>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Coffee Plantation. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
