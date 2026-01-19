import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  ChevronDown, Quote, Sprout, Coffee, TrendingUp, 
  Users, Shield, ArrowRight, Phone, MessageCircle,
  Zap, Target, Droplets, Sun, BookOpen
} from 'lucide-react';
import { 
  Box, Typography, Stack, Avatar, Grid, Container,
  Button, IconButton, Chip
} from '@mui/material';
import { Card, CardContent } from '../../ui/card';
import image2 from '../../../assets/image2.jpg';
import author from '../../../assets/author.jpg';

function Body() {
  const [activeTip, setActiveTip] = useState(0);

  const farmingTips = [
    {
      icon: <Sprout />,
      title: "Soil Preparation",
      tip: "Test soil pH (6.0-6.5 ideal), add organic compost, ensure drainage"
    },
    {
      icon: <Droplets />,
      title: "Water Management",
      tip: "Water deeply but infrequently, mulch to retain moisture"
    },
    {
      icon: <Sun />,
      title: "Sunlight Control",
      tip: "Provide partial shade, especially for young plants"
    },
    {
      icon: <Target />,
      title: "Pruning",
      tip: "Regular pruning improves airflow and yield"
    }
  ];

  const stats = [
    { icon: TrendingUp, value: "#1 Export", label: "Top product", color: "emerald" },
    { icon: Coffee, value: "Easy Growth", label: "Low maintenance", color: "amber" },
    { icon: Users, value: "700K+", label: "Farmers", color: "emerald" },
    { icon: Shield, value: "Stable", label: "Income", color: "amber" }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-amber-50">
      {/* Mobile-Optimized Hero Section */}
      <Box 
        className="relative w-full min-h-screen"
        sx={{ 
          minHeight: { xs: '100vh', sm: '100vh' },
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            src={image2}
            alt="Coffee plantation"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          {/* Mobile-optimized gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/90 via-emerald-800/80 to-amber-900/70" />
        </div>

        {/* Main Content - Mobile First */}
        <Container 
          maxWidth="xl" 
          className="relative z-10"
          sx={{ 
            px: { xs: 2, sm: 3 },
            py: { xs: 4, sm: 6 }
          }}
        >
          {/* Badge - Top Center */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <Chip
              icon={<Sprout className="w-4 h-4" />}
              label="Farmer's Insight"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.9)',
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: 2,
                py: 1,
                backdropFilter: 'blur(10px)'
              }}
            />
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-6"
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 900,
                color: 'white',
                mb: 2,
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              Coffee Farming
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
                East Africa
              </span>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: 'rgba(255, 255, 255, 0.95)',
                mb: 4,
                lineHeight: 1.5,
                maxWidth: '600px',
                mx: 'auto',
                px: 2
              }}
            >
              Empowering farming families with sustainable practices and AI-powered insights.
            </Typography>
          </motion.div>

          {/* Stats Grid - 2x2 on mobile */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <Grid container spacing={2}>
              {stats.map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="h-full"
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 h-full">
                      <CardContent className="p-0">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`p-2 rounded-xl bg-${stat.color}-500/30`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-300`} />
                          </div>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontSize: { xs: '1rem', sm: '1.125rem' },
                              fontWeight: 700,
                              color: 'white'
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Action Buttons - Stacked on Mobile */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: 'white',
                  color: 'emerald.700',
                  py: 2,
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  '&:active': {
                    transform: 'scale(0.98)'
                  },
                  transition: 'all 0.2s'
                }}
                endIcon={<ArrowRight />}
              >
                Learn Farming
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: 'white',
                  borderWidth: 2,
                  color: 'white',
                  py: 2,
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
                startIcon={<MessageCircle />}
              >
                Get Expert Help
              </Button>
            </Stack>
          </motion.div>

          {/* Farming Tips Carousel */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'white'
                    }}
                  >
                    Quick Tips
                  </Typography>
                </div>

                {/* Tip Carousel */}
                <Box sx={{ mb: 3 }}>
                  <Box className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {farmingTips[activeTip].icon}
                    </div>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'white'
                      }}
                    >
                      {farmingTips[activeTip].title}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.95)',
                      mb: 3
                    }}
                  >
                    {farmingTips[activeTip].tip}
                  </Typography>

                  {/* Carousel Dots */}
                  <div className="flex justify-center gap-2">
                    {farmingTips.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTip(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === activeTip 
                            ? 'w-8 bg-white' 
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: 'white',
                    color: 'amber.700',
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 600,
                    '&:active': {
                      transform: 'scale(0.98)'
                    }
                  }}
                  startIcon={<BookOpen className="w-4 h-4" />}
                >
                  Full Guide
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Container>

        {/* Mobile Scroll Indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => document.getElementById('expert-section')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })}
            className="text-center"
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.75rem',
                fontWeight: 500,
                mb: 1,
                display: 'block'
              }}
            >
              Tap to continue
            </Typography>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center mx-auto">
              <motion.div
                className="w-1 h-3 bg-white rounded-full mt-2"
                animate={{ opacity: [1, 0.5, 1], y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </Box>

      {/* Expert Section - Mobile Optimized */}
      <Box 
        id="expert-section"
        sx={{ 
          py: { xs: 6, sm: 8 },
          px: { xs: 2, sm: 3 },
          bgcolor: 'white'
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl border border-emerald-100 overflow-hidden">
              <CardContent className="p-4">
                <Stack spacing={5}>
                  {/* Header */}
                  <div className="text-center">
                    <motion.div
                      className="inline-block p-3 bg-gradient-to-r from-amber-100 to-emerald-100 rounded-2xl mb-3"
                      whileTap={{ rotate: 5 }}
                    >
                      <Quote className="w-8 h-8 text-amber-600" />
                    </motion.div>
                    
                    <Typography
                      variant="h2"
                      sx={{
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        fontWeight: 900,
                        color: 'grey.900',
                        mb: 1
                      }}
                    >
                      Expert{' '}
                      <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                        Advice
                      </span>
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ color: 'grey.600' }}
                    >
                      Wisdom for successful farming
                    </Typography>
                  </div>

                  {/* Quote */}
                  <Box className="relative px-3">
                    <div className="absolute -top-2 -left-2 text-4xl text-amber-200 opacity-60">
                      "
                    </div>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
                        fontWeight: 300,
                        color: 'grey.800',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        lineHeight: 1.6
                      }}
                    >
                      "Quality begins in the field. Healthy plants yield the best beans."
                    </Typography>
                    <div className="absolute -bottom-2 -right-2 text-4xl text-emerald-200 opacity-60">
                      "
                    </div>
                  </Box>

                  {/* Author Card */}
                  <motion.div
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card className="bg-white border border-grey-200 rounded-2xl">
                      <CardContent className="p-4">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={author}
                            alt="James Hernandez"
                            sx={{ 
                              width: 56, 
                              height: 56,
                              border: '3px solid white',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          
                          <Stack spacing={0.5} sx={{ flex: 1 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 700,
                                color: 'grey.900',
                                fontSize: { xs: '0.9375rem', sm: '1rem' }
                              }}
                            >
                              James Hernandez
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ color: 'grey.600' }}
                            >
                              Agriculture Specialist
                            </Typography>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Chip
                                label="Coffee Expert"
                                size="small"
                                sx={{
                                  bgcolor: 'emerald.100',
                                  color: 'emerald.800',
                                  fontSize: '0.625rem',
                                  height: 20
                                }}
                              />
                              <Chip
                                label="20+ Years"
                                size="small"
                                sx={{
                                  bgcolor: 'amber.100',
                                  color: 'amber.800',
                                  fontSize: '0.625rem',
                                  height: 20
                                }}
                              />
                            </div>
                          </Stack>
                        </Stack>
                        
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'grey.700',
                            mt: 2,
                            display: 'block',
                            fontSize: '0.75rem'
                          }}
                        >
                          Helping farmers improve yields through sustainable practices.
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Action Buttons */}
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: 'emerald.600',
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        '&:active': {
                          transform: 'scale(0.98)',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        },
                        transition: 'all 0.2s'
                      }}
                      startIcon={<MessageCircle className="w-4 h-4" />}
                    >
                      Chat with Expert
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: 'emerald.300',
                        borderWidth: 2,
                        color: 'emerald.700',
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        '&:active': {
                          transform: 'scale(0.98)'
                        },
                        transition: 'all 0.2s'
                      }}
                      startIcon={<Phone className="w-4 h-4" />}
                    >
                      Call Now
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>

      {/* Floating Call Button for Mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-4 right-4 z-50"
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <IconButton
          sx={{
            bgcolor: 'emerald.600',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
            '&:active': {
              bgcolor: 'emerald.700',
              transform: 'scale(0.95)'
            },
            transition: 'all 0.2s'
          }}
          onClick={() => window.open('tel:+254743121169', '_self')}
        >
          <Phone className="w-6 h-6" />
        </IconButton>
      </motion.div>
    </div>
  );
}

export default Body;