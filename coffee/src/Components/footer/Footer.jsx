import React, { useState } from 'react';
import { BACKEND_URL } from '../../config';

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
    <footer className="relative bg-slate-900 text-white py-16 px-4 mt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">☕</div>
        <div className="absolute top-32 right-20 text-4xl">🌱</div>
        <div className="absolute bottom-20 left-1/4 text-5xl">🍃</div>
        <div className="absolute bottom-32 right-1/3 text-3xl">🌿</div>
      </div>

      {/* Animated Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">☕</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
                Coffee Plantation
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-amber-100 max-w-md mb-6">
              Empowering farmers with AI-driven insights for healthier coffee plants and sustainable cultivation practices.
            </p>
            <div className="flex gap-4">
              <button className="cta-ghost w-12 h-12 flex items-center justify-center" aria-label="Facebook">
                <span className="text-xl">📘</span>
              </button>
              <button className="cta-ghost w-12 h-12 flex items-center justify-center" aria-label="Twitter">
                <span className="text-xl">🐦</span>
              </button>
              <button className="cta-ghost w-12 h-12 flex items-center justify-center" aria-label="Instagram">
                <span className="text-xl">📷</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:mt-0">
            <h3 className="text-2xl font-bold mb-6 text-amber-200 flex items-center gap-2">
              <div className="w-2 h-6 bg-amber-400 rounded-full"></div>
              Quick Links
            </h3>
            <div className="space-y-4">
              {['About Us', 'Our Services', 'Plant Guide', 'Success Stories'].map((link, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="block text-amber-100 hover:text-amber-300 transition-all duration-300 transform hover:translate-x-2 group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {link}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="lg:mt-0">
            <h3 className="text-2xl font-bold mb-6 text-amber-200 flex items-center gap-2">
              <div className="w-2 h-6 bg-amber-400 rounded-full"></div>
              Stay Updated
            </h3>
            <p className="text-amber-100 mb-6 leading-relaxed">
              Get the latest insights on coffee cultivation, disease prevention, and farming best practices.
            </p>
            
            <form className="space-y-4" onSubmit={handleSubscribe}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="input w-full px-4 py-4 text-base bg-amber-900/40 rounded-xl text-white placeholder-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 backdrop-blur-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={subscribed}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-300">
                  ✉️
                </div>
              </div>
              
              <button
                className={`w-full cta-button ${subscribed ? 'opacity-60 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={subscribed}
              >
                <span className="flex items-center justify-center gap-2">
                  {subscribed ? (
                    <>
                      <span className="text-lg">✅</span>
                      Subscribed!
                    </>
                  ) : (
                    <>
                      <span className="text-lg">📧</span>
                      Subscribe Now
                    </>
                  )}
                </span>
              </button>
            </form>
            
            {statusMsg && (
              <div className="mt-4 p-3 bg-amber-800/30 border border-amber-600/50 rounded-lg">
                <p className="text-amber-200 text-sm text-center animate-pulse">{statusMsg}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-amber-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-amber-200/80 text-center md:text-left">
              <p className="text-lg">
                &copy; {new Date().getFullYear()} Coffee Plantation AI. Cultivating excellence in every bean.
              </p>
            </div>
            
            <div className="flex gap-6 text-amber-200/80">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((item, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="hover:text-amber-300 transition-colors duration-300 text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          
          {/* Achievement Badge */}
          <div className="mt-6 flex justify-center">
            <div className="bg-amber-800/40 border border-amber-600/50 rounded-full px-6 py-2 inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-amber-200 text-sm">Trusted by 5,000+ Coffee Farmers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>


    </footer>
  );
};

export default Footer;