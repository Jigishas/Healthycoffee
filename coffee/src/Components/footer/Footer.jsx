import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee, Sprout, Mail, Phone, MapPin, Facebook, Twitter,
  Instagram, Youtube, ArrowRight, Shield, Award, Users,
  TrendingUp, Leaf, BookOpen, ChevronRight, CheckCircle,
  MessageCircle, Globe, Download
} from 'lucide-react';
import {
  Box, Typography, Grid, Container, TextField,
  Snackbar, Alert, IconButton, Divider
} from '@mui/material';

// Custom icon components
const Calendar = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const Target = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const Handshake = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Briefcase = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    message: ''
  });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showNotification('Please enter your email address', 'error');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    try {
      // For demo purposes, simulate API call
      setNotification({ 
        message: 'Sending confirmation email...', 
        severity: 'info' 
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubscribed(true);
      setEmail('');
      showNotification(
        'Subscription confirmed! Check your email for farming insights.',
        'success'
      );

      // Reset subscription status after 5 seconds
      setTimeout(() => setSubscribed(false), 5000);

    } catch (error) {
      console.error('Subscription error:', error);
      showNotification('Subscription failed. Please try again.', 'error');
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const quickLinks = [
    {
      title: "Farming Resources",
      links: [
        { name: "Coffee Plant Guide", icon: <BookOpen className="w-4 h-4" /> },
        { name: "Disease Prevention", icon: <Shield className="w-4 h-4" /> },
        { name: "Harvesting Calendar", icon: <Calendar className="w-4 h-4" /> },
        { name: "Market Prices", icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      title: "Farmer Support",
      links: [
        { name: "Expert Consultation", icon: <Users className="w-4 h-4" /> },
        { name: "Training Programs", icon: <Sprout className="w-4 h-4" /> },
        { name: "Community Forum", icon: <MessageCircle className="w-4 h-4" /> },
        { name: "Success Stories", icon: <Award className="w-4 h-4" /> }
      ]
    },
    {
      title: "About Us",
      links: [
        { name: "Our Mission", icon: <Target className="w-4 h-4" /> },
        { name: "Team", icon: <Users className="w-4 h-4" /> },
        { name: "Partners", icon: <Handshake className="w-4 h-4" /> },
        { name: "Careers", icon: <Briefcase className="w-4 h-4" /> }
      ]
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, name: "Facebook", color: "hover:bg-blue-600" },
    { icon: <Twitter className="w-5 h-5" />, name: "Twitter", color: "hover:bg-sky-500" },
    { icon: <Instagram className="w-5 h-5" />, name: "Instagram", color: "hover:bg-pink-600" },
    { icon: <Youtube className="w-5 h-5" />, name: "YouTube", color: "hover:bg-red-600" }
  ];

  const farmerStats = [
    { value: "10,000+", label: "Active Farmers", icon: <Users /> },
    { value: "95%", label: "Success Rate", icon: <CheckCircle /> },
    { value: "24/7", label: "Support", icon: <MessageCircle /> },
    { value: "50+", label: "Countries", icon: <Globe /> }
  ];

  const WHATSAPP_NUMBER = '254743121169'; // Example WhatsApp number

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-emerald-500 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-br from-amber-500 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Coffee Bean Pattern */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(30)].map((_, i) => (
          <Coffee
            key={i}
            className="absolute w-4 h-4 text-emerald-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      <Container maxWidth="xl" className="relative z-10">
        {/* Main Footer Content */}
        <Box sx={{ py: 8, px: { xs: 2, sm: 4 } }}>
          <Grid container spacing={6}>
            {/* Brand Column */}
            <Grid item xs={12} lg={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Box className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-xl">
                      <Coffee className="w-8 h-8 text-white" />
                    </div>
                    <Typography 
                      variant="h2" 
                      className="text-2xl md:text-3xl font-black"
                      sx={{ color: 'white' }}
                    >
                      Coffee{' '}
                      <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                        Plantation AI
                      </span>
                    </Typography>
                  </div>

                  <Typography variant="body1" className="text-slate-300 mb-6 leading-relaxed">
                    Empowering East African coffee farmers with AI-driven insights, 
                    sustainable practices, and market access for better yields and livelihoods.
                  </Typography>

                  {/* Farmer Stats */}
                  <Box className="grid grid-cols-2 gap-4 mb-8">
                    {farmerStats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl">
                            {stat.icon}
                          </div>
                          <Typography variant="h4" className="font-bold text-white">
                            {stat.value}
                          </Typography>
                        </div>
                        <Typography variant="body2" className="text-slate-300">
                          {stat.label}
                        </Typography>
                      </motion.div>
                    ))}
                  </Box>

                  {/* Contact Info */}
                  <Box className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Phone className="w-5 h-5 text-emerald-400" />
                      </div>
                      <Typography variant="body2" className="text-slate-300">
                        +254 743 121 169
                      </Typography>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Mail className="w-5 h-5 text-emerald-400" />
                      </div>
                      <Typography variant="body2" className="text-slate-300">
                        info@coffeeplantation.ai
                      </Typography>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                      </div>
                      <Typography variant="body2" className="text-slate-300">
                        Nairobi, Kenya | Serving East Africa
                      </Typography>
                    </div>
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            {/* Quick Links Columns */}
            <Grid item xs={12} lg={5}>
              <Grid container spacing={6}>
                {quickLinks.map((section, sectionIndex) => (
                  <Grid item xs={12} sm={4} key={sectionIndex}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: sectionIndex * 0.1 }}
                    >
                      <Typography 
                        variant="h6" 
                        className="font-bold mb-6 text-white flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        {section.title}
                      </Typography>
                      <Box className="space-y-4">
                        {section.links.map((link, linkIndex) => (
                          <motion.a
                            key={linkIndex}
                            href="#"
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-3 group"
                          >
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-500/20 transition-colors duration-300">
                              {link.icon}
                            </div>
                            <Typography 
                              variant="body2" 
                              className="text-slate-300 group-hover:text-emerald-300 transition-colors duration-300"
                            >
                              {link.name}
                            </Typography>
                          </motion.a>
                        ))}
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Newsletter Column */}
            <Grid item xs={12} lg={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Box className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700">
                  <Typography 
                    variant="h5" 
                    className="font-bold mb-4 text-white flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5 text-emerald-400" />
                    Farming Insights
                  </Typography>
                  
                  <Typography variant="body2" className="text-slate-300 mb-6">
                    Get weekly updates on market prices, farming tips, and disease alerts.
                  </Typography>

                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="relative">
                      <TextField
                        fullWidth
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={subscribed}
                        InputProps={{
                          className: "bg-slate-900/50 border-slate-700 text-white placeholder-slate-400",
                          sx: {
                            borderRadius: '12px',
                            '&.Mui-focused': {
                              borderColor: '#10b981',
                              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                            }
                          }
                        }}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={subscribed}
                      className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        subscribed
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white opacity-80'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {subscribed ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Subscribed!
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          Subscribe Now
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Download Resources */}
                  <Box className="mt-8 pt-6 border-t border-slate-700">
                    <Typography variant="body2" className="text-slate-300 mb-4">
                      Free Farming Resources
                    </Typography>
                    <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <Download className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-left">
                          <Typography variant="body2" className="font-medium text-white">
                            Coffee Farming Guide
                          </Typography>
                          <Typography variant="caption" className="text-slate-400">
                            PDF • 2.4 MB
                          </Typography>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                    </button>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          {/* Social Links & Bottom Bar */}
          <Box className="mt-12 pt-8 border-t border-slate-700">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <div className="flex items-center gap-6">
                  <Typography variant="body2" className="text-slate-400">
                    Connect with us:
                  </Typography>
                  <div className="flex gap-3">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href="#"
                        whileHover={{ y: -4 }}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 ${social.color} transition-all duration-300 hover:text-white`}
                        aria-label={social.name}
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-end">
                  {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map((item, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      whileHover={{ scale: 1.05 }}
                      className="text-slate-400 hover:text-emerald-300 text-sm transition-colors duration-300"
                    >
                      {item}
                    </motion.a>
                  ))}
                </div>
              </Grid>
            </Grid>

            {/* Copyright & Trust Badges */}
            <Box className="mt-8 pt-6 border-t border-slate-700">
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" className="text-slate-400">
                    © {new Date().getFullYear()} Coffee Plantation AI. All rights reserved.
                  </Typography>
                  <Typography variant="caption" className="text-slate-500 mt-1">
                    Cultivating excellence, one bean at a time. 🌱
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <div className="flex flex-wrap gap-4 justify-end">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <Typography variant="caption" className="text-slate-300">
                        Trusted by 10,000+ Farmers
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <Typography variant="caption" className="text-slate-300">
                        SSL Secured
                      </Typography>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Floating WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl shadow-2xl flex items-center gap-3">
          <MessageCircle className="w-6 h-6" />
          <span className="font-semibold">Chat Now</span>
        </div>
      </motion.a>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.severity}
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer;