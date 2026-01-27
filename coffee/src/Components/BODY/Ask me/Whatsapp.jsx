import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Mail, Clock, CheckCircle, Send, User, Coffee, Shield, Leaf, TrendingUp, ChevronRight, Star, Users } from 'lucide-react';
import { Box, Typography, Grid, Container, TextField, TextareaAutosize, Alert, Snackbar } from '@mui/material';

const WHATSAPP_NUMBER = '254743121169';
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

  const handleCloseNotification = () => setNotification(null);

  return (
    <Box sx={{ 
      py: { xs: 6, sm: 8, md: 12 }, 
      px: { xs: 1, sm: 2, md: 4 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)',
      position: 'relative',
      overflow: 'hidden'
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

      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Grid container spacing={4} alignItems="stretch">
          {/* Left Column - Info & Stats */}
          
               

          {/* Right Column - Contact Form */}
          <Grid item xs={12} lg={7}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-grey-200 overflow-hidden">
                {/* Form Header */}
                <Box className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-3 sm:p-4 md:p-6">
                  <Typography 
                    variant="h3" 
                    className="text-base sm:text-lg md:text-xl font-bold text-white"
                  >
                    Send Message
                  </Typography>
                </Box>

                <Box className="p-4 sm:p-6 md:p-8">
                  {/* Quick Replies */}
                  <Box className="mb-3 sm:mb-4">
                    <Typography variant="body2" className="font-medium text-grey-700 mb-2 text-xs sm:text-sm">Topics</Typography>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {COMMON_QUESTIONS.map((question, index) => (
                        <motion.button key={index} whileTap={{ scale: 0.95 }} onClick={() => { setMessage(question); showNotification(`"${question}" added to message`, 'info'); }} className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg font-medium hover:border-emerald-300 transition-all text-xs whitespace-nowrap">
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </Box>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {/* Personal Info */}
                    <Grid container spacing={1.5} sm={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          placeholder="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <User className="w-3.5 h-3.5 text-grey-400 mr-1.5" />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          placeholder="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <Mail className="w-3.5 h-3.5 text-grey-400 mr-1.5" />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Category - Mobile Optimized */}
                    <Box>
                      <Typography variant="body2" className="font-medium text-grey-700 mb-2 text-xs sm:text-sm">Category</Typography>
                      <div className="relative">
                        {/* Mobile Dropdown */}
                        <div className="sm:hidden">
                          <button type="button" onClick={() => setShowCategoryMenu(!showCategoryMenu)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${category ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' : 'bg-grey-100 text-grey-700'}`}>
                            <span>{category || 'Select'}</span>
                            <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showCategoryMenu ? 'rotate-90' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {showCategoryMenu && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute z-10 w-full mt-1.5 bg-white rounded-lg shadow-md border border-grey-200 overflow-hidden">
                                {CATEGORIES.map((cat) => (
                                  <button key={cat} type="button" onClick={() => { setCategory(cat); setShowCategoryMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors border-b border-grey-100 last:border-b-0">
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
                            <button key={cat} type="button" onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${category === cat ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' : 'bg-grey-100 text-grey-700 hover:bg-grey-200'}`}>
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Box>

                    {/* Message Box */}
                    <Box>
                      <div className="relative">
                        <TextareaAutosize minRows={3} maxRows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message..." className="w-full px-3 py-2 text-grey-900 bg-grey-50 border border-grey-300 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 resize-none placeholder-grey-400 text-sm" maxLength={1000} />
                        <div className="absolute bottom-2 right-2">
                          <span className="text-xs text-grey-400 bg-white/90 px-2 py-0.5 rounded">{message.length}/1000</span>
                        </div>
                      </div>
                    </Box>

                    {/* Action Buttons */}
                    <Grid container spacing={1.5} sm={2}>
                      <Grid item xs={12} sm={6}>
                        <motion.button type="submit" whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 text-sm">
                          <Send className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </motion.button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={handleWhatsAppClick} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </motion.button>
                      </Grid>
                    </Grid>
                  </form>

                  {/* Additional Contact Options */}
                  <Box className="mt-4 pt-4 border-t border-grey-200">
                    <Typography variant="body2" className="text-grey-600 mb-2.5 text-center text-xs sm:text-sm">Other contacts</Typography>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button onClick={() => window.open('tel:+254743121169', '_self')} className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 rounded-lg hover:border-blue-300 transition-all duration-300 whitespace-nowrap">
                        <Phone className="w-3.5 h-3.5" />
                        <span>+254 743 121 169</span>
                      </button>
                      <button onClick={() => window.open('mailto:support@coffeefarmingai.com', '_blank')} className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 text-orange-700 rounded-lg hover:border-orange-300 transition-all duration-300">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </button>
                    </div>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Notification Snackbar */}
      <Snackbar open={!!notification} autoHideDuration={3000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification?.severity} sx={{ width: '90%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Whatsapp;