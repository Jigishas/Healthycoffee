import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Phone, Mail, Clock, CheckCircle, 
  Send, User, Coffee, Shield, Zap, Leaf, TrendingUp,
  ChevronRight, Calendar, MapPin, Award, Users
} from 'lucide-react';
import { 
  Box, Typography, Grid, Container, Chip,
  TextField, TextareaAutosize, Alert, Snackbar
} from '@mui/material';

const WHATSAPP_NUMBER = '254743121169';
const BUSINESS_HOURS = {
  weekdays: '8:00 AM - 6:00 PM',
  weekends: '9:00 AM - 4:00 PM',
  timezone: 'EAT (GMT+3)'
};

const Whatsapp = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);

  // Common questions for quick replies
  const commonQuestions = [
    "Coffee plant diseases treatment",
    "Best fertilizers for coffee",
    "Market prices today",
    "Organic farming certification",
    "Harvesting techniques",
    "Coffee processing methods",
    "Export requirements",
    "Cooperatives membership"
  ];

  useEffect(() => {
    // Simulate typing indicator
    if (message.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!message.trim()) {
      showNotification('Please enter your message', 'error');
      return;
    }

    showNotification('Message saved! Ready to send on WhatsApp', 'success');
    
    // Clear form after successful submission
    setTimeout(() => {
      setMessage('');
      setName('');
      setEmail('');
      setCategory('');
    }, 1500);
  };

  const handleWhatsAppClick = () => {
    let text = message.trim();
    
    if (!text) {
      text = "Hello! I'm interested in learning more about coffee farming.";
    }
    
    // Add user info if provided
    if (name) text += `\n\nName: ${name}`;
    if (email) text += `\nEmail: ${email}`;
    if (category) text += `\nCategory: ${category}`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    
    // Track the click
    showNotification('Opening WhatsApp...', 'info');
  };

  const handleQuickReply = (text) => {
    setMessage(text);
    showNotification(`"${text}" added to message`, 'info');
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const stats = [
    { icon: <Clock />, label: 'Response Time', value: 'Under 15 mins' },
    { icon: <CheckCircle />, label: 'Success Rate', value: '98%' },
    { icon: <Users />, label: 'Farmers Helped', value: '10,000+' },
    { icon: <Award />, label: 'Expert Rating', value: '4.9/5' }
  ];

  return (
    <Box sx={{ 
      py: { xs: 8, md: 12 }, 
      px: { xs: 2, sm: 4 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl" />
        
        {/* WhatsApp Pattern */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <MessageCircle
              key={i}
              className="absolute w-8 h-8 text-emerald-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      </div>

      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left Column - Info & Stats */}
          <Grid item xs={12} lg={5}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box className="sticky top-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-xl">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography 
                      variant="h3" 
                      className="text-2xl md:text-3xl font-black text-grey-900"
                    >
                      Connect with{' '}
                      <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                        Coffee Experts
                      </span>
                    </Typography>
                    <Typography variant="body1" className="text-grey-600">
                      Get instant help from our agricultural specialists
                    </Typography>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Box className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-grey-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
                            {stat.icon}
                          </div>
                          <Typography variant="body2" className="font-semibold text-grey-700">
                            {stat.label}
                          </Typography>
                        </div>
                        <Typography variant="h5" className="font-bold text-emerald-700">
                          {stat.value}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </div>

                {/* Benefits */}
                <Box className="mb-8">
                  <Typography variant="h6" className="font-semibold text-grey-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Why Connect With Us?
                  </Typography>
                  <div className="space-y-3">
                    {[
                      { icon: <Shield />, text: 'Expert advice from certified agriculturists' },
                      { icon: <Leaf />, text: 'Sustainable farming solutions' },
                      { icon: <TrendingUp />, text: 'Market insights and price updates' },
                      { icon: <Coffee />, text: 'Specialized coffee cultivation guidance' }
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-white/50 rounded-xl"
                      >
                        <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg">
                          {benefit.icon}
                        </div>
                        <Typography variant="body2" className="text-grey-700">
                          {benefit.text}
                        </Typography>
                      </motion.div>
                    ))}
                  </div>
                </Box>

                {/* Business Hours */}
                <Box className="bg-gradient-to-r from-emerald-500/10 to-amber-500/10 p-6 rounded-2xl border border-emerald-200/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-emerald-600" />
                    <Typography variant="h6" className="font-semibold text-emerald-800">
                      Available Hours
                    </Typography>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Typography variant="body2" className="text-grey-700">
                        Monday - Friday
                      </Typography>
                      <Typography variant="body2" className="font-semibold text-emerald-700">
                        {BUSINESS_HOURS.weekdays}
                      </Typography>
                    </div>
                    <div className="flex justify-between items-center">
                      <Typography variant="body2" className="text-grey-700">
                        Saturday - Sunday
                      </Typography>
                      <Typography variant="body2" className="font-semibold text-emerald-700">
                        {BUSINESS_HOURS.weekends}
                      </Typography>
                    </div>
                    <div className="pt-2 border-t border-emerald-200">
                      <Typography variant="caption" className="text-grey-600">
                        Timezone: {BUSINESS_HOURS.timezone}
                      </Typography>
                    </div>
                  </div>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Column - Contact Form */}
          <Grid item xs={12} lg={7}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box className="bg-white rounded-3xl shadow-2xl border border-grey-200 overflow-hidden">
                {/* Form Header */}
                <Box className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 md:p-8">
                  <Typography 
                    variant="h2" 
                    className="text-xl md:text-2xl font-bold text-white mb-2"
                  >
                    Send Your Inquiry
                  </Typography>
                  <Typography variant="body1" className="text-emerald-100">
                    Get personalized advice for your coffee farming needs
                  </Typography>
                </Box>

                <Box className="p-6 md:p-8">
                  {/* Quick Replies */}
                  <Box className="mb-6">
                    <Typography variant="h6" className="font-semibold text-grey-800 mb-4 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                      Common Questions
                    </Typography>
                    <div className="flex flex-wrap gap-3">
                      {commonQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickReply(question)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-medium hover:border-emerald-300 transition-all duration-300"
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </Box>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <div className="relative">
                          <TextField
                            fullWidth
                            label="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <User className="w-5 h-5 text-grey-400 mr-2" />
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              },
                            }}
                          />
                        </div>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <div className="relative">
                          <TextField
                            fullWidth
                            label="Email (Optional)"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <Mail className="w-5 h-5 text-grey-400 mr-2" />
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              },
                            }}
                          />
                        </div>
                      </Grid>
                    </Grid>

                    {/* Category */}
                    <Box>
                      <Typography variant="body2" className="font-medium text-grey-700 mb-2">
                        What do you need help with?
                      </Typography>
                      <div className="flex flex-wrap gap-3">
                        {['Diseases', 'Fertilizers', 'Harvesting', 'Processing', 'Marketing', 'Other'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                              category === cat
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </Box>

                    {/* Message Box */}
                    <Box>
                      <div className="relative mb-2">
                        <TextareaAutosize
                          minRows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Describe your coffee farming question or challenge..."
                          className="w-full px-4 py-3 text-grey-900 bg-grey-50 border border-grey-300 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 resize-none placeholder-grey-500"
                          maxLength={1000}
                        />
                        <div className="absolute bottom-2 right-2">
                          <div className="flex items-center gap-2">
                            {isTyping && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                </div>
                              </motion.div>
                            )}
                            <span className="text-xs text-grey-400 bg-white/90 px-2 py-1 rounded-full">
                              {message.length}/1000
                            </span>
                          </div>
                        </div>
                      </div>
                      <Typography variant="caption" className="text-grey-500">
                        Include details like location, plant age, symptoms, or photos for better assistance
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300"
                        >
                          <Send className="w-5 h-5" />
                          <span>Save Message</span>
                        </motion.button>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleWhatsAppClick}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>Chat on WhatsApp</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </Grid>
                    </Grid>
                  </form>

                  {/* Additional Contact Options */}
                  <Box className="mt-8 pt-8 border-t border-grey-200">
                    <Typography variant="body2" className="text-grey-600 mb-4 text-center">
                      Prefer other contact methods?
                    </Typography>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 rounded-xl hover:border-blue-300 transition-all duration-300">
                        <Phone className="w-5 h-5" />
                        <span>Call: +254 743 121 169</span>
                      </button>
                      <button className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 text-orange-700 rounded-xl hover:border-orange-300 transition-all duration-300">
                        <Mail className="w-5 h-5" />
                        <span>Email Us</span>
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
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.severity}
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Whatsapp;