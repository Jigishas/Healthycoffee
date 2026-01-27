import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Mail, Clock, CheckCircle, Send, User, Coffee, Shield, Leaf, TrendingUp, ChevronRight, Star, Users } from 'lucide-react';

const WHATSAPP_NUMBER = '+254743121169';
const BUSINESS_HOURS = { weekdays: '8:00 AM - 6:00 PM', weekends: '9:00 AM - 4:00 PM', timezone: 'EAT (GMT+3)' };
const COMMON_QUESTIONS = ["Coffee plant diseases", "Best fertilizers", "Market prices", "Organic farming", "Harvesting tips", "Processing methods", "Export requirements", "Cooperatives"];
const CATEGORIES = ['Diseases', 'Fertilizers', 'Harvesting', 'Processing', 'Marketing', 'Other'];
const BENEFITS = [
  { icon: Shield, text: 'Expert advice' },
  { icon: Leaf, text: 'Sustainable farming' },
  { icon: TrendingUp, text: 'Market updates' },
  { icon: Coffee, text: 'Coffee guidance' }
];
const STATS = [
  { icon: Clock, label: 'Response Time', value: '<15 mins' },
  { icon: CheckCircle, label: 'Success Rate', value: '98%' },
  { icon: Users, label: 'Farmers Helped', value: '10K+' },
  { icon: Star, label: 'Rating', value: '4.9/5' }
];

const Whatsapp = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [notification, setNotification] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) { showNotification('Please enter your message', 'error'); return; }
    showNotification('Message saved! Ready to send on WhatsApp', 'success');
    setTimeout(() => { setMessage(''); setName(''); setEmail(''); setCategory(''); }, 1500);
  };

  const handleWhatsAppClick = () => {
    let text = message.trim() || "Hello! I'm interested in learning more about coffee farming.";
    if (name) text += `\n\nName: ${name}`;
    if (email) text += `\nEmail: ${email}`;
    if (category) text += `\nCategory: ${category}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    showNotification('Opening WhatsApp...', 'info');
  };

  const showNotification = (message, severity = 'info') => setNotification({ message, severity });


  return (
    <div style={{
      py: 6,
      px: 1,
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '6rem',
      paddingBottom: '6rem',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <MessageCircle key={i} className="absolute text-emerald-400" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 20 + 20}px`, height: `${Math.random() * 20 + 20}px`, transform: `rotate(${Math.random() * 360}deg)` }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'stretch' }}>
          {/* Left Column - Info & Stats */}
          
               

          {/* Right Column - Contact Form */}
          <div style={{ gridColumn: '1/-1' }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-grey-200 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-3 sm:p-4 md:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                    Send Message
                  </h3>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  {/* Quick Replies */}
                  <div className="mb-3 sm:mb-4">
                    <p className="font-medium text-grey-700 mb-2 text-xs sm:text-sm">Topics</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {COMMON_QUESTIONS.map((question, index) => (
                        <motion.button key={index} whileTap={{ scale: 0.95 }} onClick={() => { setMessage(question); showNotification(`"${question}" added to message`, 'info'); }} className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg font-medium hover:border-emerald-300 transition-all text-xs whitespace-nowrap">
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {/* Personal Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <input
                          placeholder="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <input
                          placeholder="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    {/* Category - Mobile Optimized */}
                    <div>
                      <p className="font-medium text-grey-700 mb-2 text-xs sm:text-sm">Category</p>
                      <div className="relative">
                        {/* Mobile Dropdown */}
                        <div className="sm:hidden">
                          <button type="button" onClick={() => setShowCategoryMenu(!showCategoryMenu)} style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.625rem 0.75rem',
                            borderRadius: '8px',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            transition: 'all 0.3s',
                            background: category ? 'linear-gradient(to right, rgb(16, 185, 129), rgb(5, 150, 105))' : 'rgb(243, 244, 246)',
                            color: category ? 'white' : 'rgb(55, 65, 81)',
                            border: 'none',
                            cursor: 'pointer'
                          }}>
                            <span>{category || 'Select'}</span>
                            <ChevronRight style={{
                              width: '14px',
                              height: '14px',
                              transform: showCategoryMenu ? 'rotate(90deg)' : '',
                              transition: 'transform 0.3s'
                            }} />
                          </button>
                          <AnimatePresence>
                            {showCategoryMenu && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{
                                position: 'absolute',
                                zIndex: 10,
                                width: '100%',
                                marginTop: '0.375rem',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgb(229, 231, 235)',
                                overflow: 'hidden'
                              }}>
                                {CATEGORIES.map((cat) => (
                                  <button key={cat} type="button" onClick={() => { setCategory(cat); setShowCategoryMenu(false); }} style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    textAlign: 'left',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid rgb(229, 231, 235)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                  }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(236, 253, 245)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    {cat}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {/* Desktop Buttons */}
                        <div className="hidden sm:flex flex-wrap gap-1.5">
                          {CATEGORIES.map((cat) => (
                            <button key={cat} type="button" onClick={() => setCategory(cat)} style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              transition: 'all 0.3s',
                              background: category === cat ? 'linear-gradient(to right, rgb(16, 185, 129), rgb(5, 150, 105))' : 'rgb(243, 244, 246)',
                              color: category === cat ? 'white' : 'rgb(55, 65, 81)',
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: category === cat ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                            }} onMouseEnter={(e) => !category.includes(cat) && (e.currentTarget.style.backgroundColor = 'rgb(229, 231, 235)')} onMouseLeave={(e) => !category.includes(cat) && (e.currentTarget.style.backgroundColor = 'rgb(243, 244, 246)')}>
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div>
                      <div style={{ position: 'relative' }}>
                        <textarea 
                          value={message} 
                          onChange={(e) => setMessage(e.target.value)} 
                          placeholder="Your message..." 
                          maxLength={1000}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            color: 'rgb(17, 24, 39)',
                            backgroundColor: 'rgb(249, 250, 251)',
                            border: '1px solid rgb(209, 213, 219)',
                            borderRadius: '8px',
                            outline: 'none',
                            minHeight: '4rem',
                            maxHeight: '8rem',
                            resize: 'none',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(16, 185, 129)'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'rgb(209, 213, 219)'}
                        />
                        <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'rgb(156, 163, 175)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>{message.length}/1000</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                      <motion.button type="submit" whileTap={{ scale: 0.98 }} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.625rem 0.75rem',
                        background: 'linear-gradient(to right, rgb(5, 150, 105), rgb(4, 120, 87))',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}>
                        <Send style={{ width: '14px', height: '14px' }} />
                        <span>Save</span>
                      </motion.button>
                      <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={handleWhatsAppClick} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.625rem 0.75rem',
                        background: 'linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}>
                        <MessageCircle style={{ width: '14px', height: '14px' }} />
                        <span>WhatsApp</span>
                      </motion.button>
                    </div>
                  </form>

                  {/* Additional Contact Options */}
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgb(229, 231, 235)' }}>
                    <p style={{ color: 'rgb(75, 85, 99)', marginBottom: '0.625rem', textAlign: 'center', fontSize: '0.75rem' }}>Other contacts</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => window.open('tel:+254743121169', '_self')} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        background: 'linear-gradient(to right, rgb(219, 234, 254), rgb(191, 219, 254))',
                        border: '1px solid rgb(191, 219, 254)',
                        color: 'rgb(30, 58, 138)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap'
                      }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(147, 197, 253)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(191, 219, 254)'}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        <span>+254 743 121 169</span>
                      </button>
                      <button onClick={() => window.open('mailto:support@coffeefarmingai.com', '_blank')} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        background: 'linear-gradient(to right, rgb(254, 237, 215), rgb(253, 230, 197))',
                        border: '1px solid rgb(253, 230, 197)',
                        color: 'rgb(124, 45, 18)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(251, 191, 126)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(253, 230, 197)'}>
                        <Mail style={{ width: '14px', height: '14px' }} />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            maxWidth: '400px',
            width: '90%'
          }}
        >
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            fontSize: '0.875rem',
            background: notification?.severity === 'error' ? 'rgb(254, 226, 226)' : notification?.severity === 'success' ? 'rgb(220, 252, 231)' : 'rgb(219, 234, 254)',
            color: notification?.severity === 'error' ? 'rgb(127, 29, 29)' : notification?.severity === 'success' ? 'rgb(22, 101, 52)' : 'rgb(30, 58, 138)',
            border: `1px solid ${notification?.severity === 'error' ? 'rgb(252, 165, 165)' : notification?.severity === 'success' ? 'rgb(167, 243, 208)' : 'rgb(147, 197, 253)'}`
          }}>
            {notification?.message}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Whatsapp;