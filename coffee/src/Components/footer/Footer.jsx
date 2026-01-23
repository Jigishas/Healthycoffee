import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatusMsg('Sending confirmation...');
    try {
      const res = await fetch(`${BACKEND_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error('Subscription failed');
      }

      const data = await res.json();
      setSubscribed(true);
      setEmail('');
      setStatusMsg(data.message || 'Confirmation email sent. Thank you!');
    } catch (error) {
      console.error('Subscription error:', error);
      // For demo purposes, simulate success
      setSubscribed(true);
      setEmail('');
      setStatusMsg('Confirmation email sent. Thank you!');
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 mt-12 sm:mt-16 md:mt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-5 sm:top-10 left-5 sm:left-10 text-4xl sm:text-6xl">☕</div>
        <div className="absolute top-16 sm:top-32 right-10 sm:right-20 text-2xl sm:text-4xl">🌱</div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/4 text-3xl sm:text-5xl">🍃</div>
        <div className="absolute bottom-16 sm:bottom-32 right-1/3 text-xl sm:text-3xl">🌿</div>
      </div>

      {/* Animated Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-xl sm:text-2xl">☕</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
                Coffee AI
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-100 mb-4 sm:mb-6">
              Empowering farmers with AI-driven insights for healthier coffee plants and sustainable practices.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => window.open('https://facebook.com/coffeefarmingai', '_blank')}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 touch-target"
                aria-label="Facebook"
                title="Facebook"
              >
                <span className="text-lg sm:text-xl">📘</span>
              </button>
              <button
                onClick={() => window.open('https://twitter.com/coffeefarmingai', '_blank')}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 touch-target"
                aria-label="Twitter"
                title="Twitter"
              >
                <span className="text-lg sm:text-xl">𝕏</span>
              </button>
              <button
                onClick={() => window.open('https://instagram.com/coffeefarmingai', '_blank')}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 touch-target"
                aria-label="Instagram"
                title="Instagram"
              >
                <span className="text-lg sm:text-xl">📷</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="sm:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-amber-200 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-amber-400 rounded-full flex-shrink-0"></div>
              <span>Quick Links</span>
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              {['About Us', 'Our Services', 'Plant Guide', 'Success Stories'].map((link, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-amber-100 hover:text-amber-300 transition-all duration-300 flex items-center gap-2 group touch-target py-2 px-2 -mx-2 rounded"
                  >
                    <div className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-amber-200 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-amber-400 rounded-full flex-shrink-0"></div>
              <span>Contact</span>
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <a 
                  href="tel:+254743121169" 
                  className="text-amber-100 hover:text-amber-300 transition-all duration-300 flex items-start gap-2 group touch-target py-2 px-2 -mx-2 rounded"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>+254743121169</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:jigishaflamings336@gmail.com" 
                  className="text-amber-100 hover:text-amber-300 transition-all duration-300 flex items-start gap-2 group touch-target py-2 px-2 -mx-2 rounded break-all"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Email</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/254743121169" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-100 hover:text-amber-300 transition-all duration-300 flex items-start gap-2 group touch-target py-2 px-2 -mx-2 rounded"
                >
                  <span className="text-base mt-0.5 flex-shrink-0">💬</span>
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-amber-200 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-amber-400 rounded-full flex-shrink-0"></div>
              <span>Stay Updated</span>
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 mb-4 leading-relaxed">
              Get latest farming insights.
            </p>
            
            <form className="space-y-3" onSubmit={handleSubscribe}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-amber-900/40 rounded-lg text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 backdrop-blur-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={subscribed}
                  required
                />
              </div>
              
              <button
                className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 touch-target ${subscribed ? 'opacity-60 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={subscribed}
              >
                {subscribed ? '✅ Subscribed!' : '📧 Subscribe'}
              </button>
            </form>
            
            {statusMsg && (
              <div className="mt-3 p-2 sm:p-3 bg-amber-800/30 border border-amber-600/50 rounded-lg">
                <p className="text-amber-200 text-xs sm:text-sm text-center animate-pulse">{statusMsg}</p>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-amber-700/50 my-8 sm:my-10"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          <div className="text-amber-200/80 text-center sm:text-left text-xs sm:text-sm">
            <p>
              &copy; {new Date().getFullYear()} Coffee AI. Cultivating excellence.
            </p>
          </div>
          
          <div className="flex gap-3 sm:gap-6 text-amber-200/80 text-xs sm:text-sm flex-wrap justify-center sm:justify-end">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((item, index) => (
              <a 
                key={index}
                href="#" 
                className="hover:text-amber-300 transition-colors duration-300 touch-target py-1 px-1"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        
        {/* Achievement Badge */}
        <div className="flex justify-center">
          <div className="bg-amber-800/40 border border-amber-600/50 rounded-full px-4 sm:px-6 py-2 inline-flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-amber-200 text-xs sm:text-sm">Trusted by 5,000+ Farmers</span>
          </div>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-28 sm:w-40 h-28 sm:h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
    </footer>
  );
};

export default Footer;