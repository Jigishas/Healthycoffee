import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  Leaf, Heart, Shield, WandSparkles, Sprout, Coffee,
  TrendingUp, Target, BarChart, Users, Zap, CheckCircle,
  Droplets, Thermometer, Sun, Clock
} from 'lucide-react';
import { Box, Typography, Grid, Container, Chip } from '@mui/material';

const Belowimg = () => {
  const benefits = [
    {
      icon: <Sprout />,
      title: "Higher Yield Potential",
      description: "Healthy plants produce 30-50% more cherries",
      stats: "40% Increase",
      color: "emerald",
      details: ["Better nutrient absorption", "Stronger root systems", "Optimal photosynthesis"]
    },
    {
      icon: <Coffee />,
      title: "Premium Quality Beans",
      description: "Improved bean density and flavor complexity",
      stats: "Grade AA Quality",
      color: "amber",
      details: ["Higher cupping scores", "Better market price", "Export grade quality"]
    },
    {
      icon: <Shield />,
      title: "Disease Resistance",
      description: "Natural immunity against common pathogens",
      stats: "95% Prevention",
      color: "blue",
      details: ["Leaf rust resistance", "Berry disease immunity", "Root rot prevention"]
    },
    {
      icon: <TrendingUp />,
      title: "Sustainable Income",
      description: "Stable yields ensure consistent farmer revenue",
      stats: "25% More Profit",
      color: "green",
      details: ["Reduced input costs", "Higher market value", "Long-term sustainability"]
    }
  ];

  const aiImpact = [
    {
      icon: <WandSparkles />,
      title: "Predictive Analysis",
      description: "AI forecasts disease outbreaks 2 weeks in advance",
      improvement: "90% Accuracy"
    },
    {
      icon: <Target />,
      title: "Precision Farming",
      description: "Optimal fertilizer and water recommendations",
      improvement: "40% Resource Saving"
    },
    {
      icon: <BarChart />,
      title: "Yield Optimization",
      description: "Data-driven pruning and harvesting schedules",
      improvement: "35% Yield Increase"
    },
    {
      icon: <Zap />,
      title: "Real-time Monitoring",
      description: "24/7 plant health tracking and alerts",
      improvement: "60% Faster Response"
    }
  ];

  const growingConditions = [
    { icon: <Thermometer />, label: "Temperature", value: "15-24°C", ideal: "Optimal for Arabica" },
    { icon: <Droplets />, label: "Rainfall", value: "1500-2500mm", ideal: "Well distributed" },
    { icon: <Sun />, label: "Sunlight", value: "Partial Shade", ideal: "4-6 hours daily" },
    { icon: <Clock />, label: "Maturation", value: "3-4 Years", ideal: "First harvest" }
  ];

  return (
    <Box sx={{ 
      py: { xs: 8, sm: 10, md: 16 }, 
      px: { xs: 2, sm: 3, md: 4 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #f0f9ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl" />
        
        {/* Coffee Leaf Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <Leaf
              key={i}
              className="absolute text-emerald-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 30 + 15}px`,
                height: `${Math.random() * 30 + 15}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.3 + 0.1
              }}
            />
          ))}
        </div>
      </div>

      <Container maxWidth="xl" className="relative z-10" sx={{ px: { xs: 1, sm: 2 } }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-8 md:mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <Typography 
              variant="h5" 
              className="font-bold text-emerald-700"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                whiteSpace: 'nowrap'
              }}
            >
              Coffee Plant Health
            </Typography>
          </div>

          <Typography 
            variant="h1" 
            className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4"
            sx={{ 
              color: 'grey.900',
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
              px: { xs: 1, sm: 0 }
            }}
          >
            The Foundation of{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Quality Coffee
            </span>
          </Typography>

          <Typography 
            variant="h6" 
            className="text-base sm:text-lg md:text-xl text-grey-600 mx-auto mb-6 sm:mb-8"
            sx={{ 
              fontWeight: 400,
              maxWidth: '95%',
              px: { xs: 1, sm: 0 },
              lineHeight: 1.5
            }}
          >
            Healthy coffee plants ensure premium quality beans, sustainable yields, and resilient farming practices across East Africa
          </Typography>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <Box className="bg-gradient-to-br from-white to-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            {/* Card Header */}
            <Box className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6 md:p-8 lg:p-12">
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant="h2" 
                    className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 sm:mb-4"
                    sx={{ lineHeight: { xs: 1.3, sm: 1.4 } }}
                  >
                    Why Plant Health Matters
                  </Typography>
                  <Typography variant="body1" className="text-emerald-100 leading-relaxed"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: 1.6
                    }}
                  >
                    A healthy coffee plant is the foundation of the entire industry. It ensures high yields of quality 
                    beans, supports farmer livelihoods, and provides natural resistance against pests and diseases.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="flex justify-center mt-4 md:mt-0"
                  >
                    <div className="relative">
                      <div className="absolute -inset-3 sm:-inset-4 bg-white/20 rounded-full blur-xl" />
                      <div className="relative bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/20">
                        <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                      </div>
                    </div>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            {/* Benefits Section */}
            <Box className="p-4 sm:p-6 md:p-8 lg:p-12">
              <Typography 
                variant="h3" 
                className="text-lg sm:text-xl md:text-2xl font-bold text-grey-900 mb-6 sm:mb-8 flex items-center gap-3"
                sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.5rem' } }}
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-500" />
                Key Benefits of Healthy Coffee Plants
              </Typography>

              <Grid container spacing={3} className="mb-8 sm:mb-12">
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -4 }}
                    >
                      <Box className={`bg-gradient-to-br from-${benefit.color}-50 to-${benefit.color}-100 border-2 border-${benefit.color}-200 rounded-3xl p-4 sm:p-5 md:p-6 h-full transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl`}>
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className={`p-2 sm:p-3 bg-gradient-to-r from-${benefit.color}-500 to-${benefit.color}-600 rounded-2xl`}>
                            <div className="text-white w-6 h-6 sm:w-8 sm:h-8">
                              {React.cloneElement(benefit.icon, { 
                                className: "w-full h-full" 
                              })}
                            </div>
                          </div>
                          <Chip 
                            label={benefit.stats}
                            className={`bg-${benefit.color}-100 text-${benefit.color}-800 font-semibold`}
                            size="small"
                            sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                        </div>
                        
                        <Typography 
                          variant="h5" 
                          className={`font-bold text-${benefit.color}-800 mb-2`}
                          sx={{ 
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                            lineHeight: 1.3
                          }}
                        >
                          {benefit.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          className="text-grey-600 mb-3 sm:mb-4"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            lineHeight: 1.4
                          }}
                        >
                          {benefit.description}
                        </Typography>
                        
                        <div className="space-y-1 sm:space-y-2">
                          {benefit.details.map((detail, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full bg-${benefit.color}-500 flex-shrink-0`} />
                              <Typography 
                                variant="caption" 
                                className="text-grey-700"
                                sx={{ 
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  lineHeight: 1.3
                                }}
                              >
                                {detail}
                              </Typography>
                            </div>
                          ))}
                        </div>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Growing Conditions */}
              <Box className="mb-8 sm:mb-12">
                <Typography 
                  variant="h3" 
                  className="text-lg sm:text-xl md:text-2xl font-bold text-grey-900 mb-6 sm:mb-8 flex items-center gap-3"
                  sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.5rem' } }}
                >
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-500" />
                  Ideal Growing Conditions
                </Typography>
                
                <Grid container spacing={2} className="sm:gap-3">
                  {growingConditions.map((condition, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Box className="bg-white border border-emerald-100 rounded-2xl p-3 sm:p-4 text-center hover:shadow-md sm:hover:shadow-lg transition-shadow duration-300 h-full">
                          <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl mb-2 sm:mb-3">
                            <div className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6">
                              {React.cloneElement(condition.icon, { 
                                className: "w-full h-full" 
                              })}
                            </div>
                          </div>
                          <Typography 
                            variant="body2" 
                            className="font-semibold text-grey-700 mb-1"
                            sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              lineHeight: 1.2
                            }}
                          >
                            {condition.label}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            className="font-bold text-emerald-700 mb-1"
                            sx={{ 
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              lineHeight: 1.2
                            }}
                          >
                            {condition.value}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            className="text-grey-500"
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              lineHeight: 1.2
                            }}
                          >
                            {condition.ideal}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* AI Impact Section */}
              <Box className="bg-gradient-to-r from-emerald-500/5 to-amber-500/5 rounded-3xl p-4 sm:p-6 md:p-8 border border-emerald-200">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex-shrink-0">
                    <WandSparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <Typography 
                      variant="h3" 
                      className="text-lg sm:text-xl md:text-2xl font-bold text-grey-900"
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.125rem', md: '1.5rem' },
                        lineHeight: 1.3
                      }}
                    >
                      AI-Driven Agricultural Revolution
                    </Typography>
                    <Typography 
                      variant="body1" 
                      className="text-grey-600"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        lineHeight: 1.4
                      }}
                    >
                      Transforming coffee farming with intelligent technology
                    </Typography>
                  </div>
                </div>

                <Grid container spacing={3}>
                  {aiImpact.map((impact, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 3 }}
                      >
                        <Box className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-lg transition-all duration-300 h-full">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex-shrink-0">
                              <div className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6">
                                {React.cloneElement(impact.icon, { 
                                  className: "w-full h-full" 
                                })}
                              </div>
                            </div>
                            <Chip 
                              label={impact.improvement}
                              className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 font-semibold"
                              size="small"
                              sx={{ 
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                height: { xs: 20, sm: 24 }
                              }}
                            />
                          </div>
                          
                          <Typography 
                            variant="h6" 
                            className="font-bold text-grey-900 mb-2"
                            sx={{ 
                              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                              lineHeight: 1.3
                            }}
                          >
                            {impact.title}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            className="text-grey-600"
                            sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              lineHeight: 1.4
                            }}
                          >
                            {impact.description}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-emerald-200"
                >
                  <Typography 
                    variant="body1" 
                    className="text-grey-700 leading-relaxed text-center"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      lineHeight: 1.5,
                      px: { xs: 1, sm: 0 }
                    }}
                  >
                    <span className="font-semibold text-emerald-700">AI integration in coffee farming</span> enables predictive disease detection, 
                    precision resource management, and yield optimization—ensuring healthier plants, 
                    better quality beans, and sustainable growth for East African coffee farmers.
                  </Typography>
                </motion.div>
              </Box>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-8 sm:mt-12 text-center"
              >
                <Box className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button 
                    className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base"
                    style={{ minWidth: 'fit-content' }}
                  >
                    Learn Farming Best Practices
                  </button>
                  <button 
                    className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300 text-sm sm:text-base"
                    style={{ minWidth: 'fit-content' }}
                  >
                    Get AI Farming Tools
                  </button>
                </Box>
                
                <Typography 
                  variant="caption" 
                  className="text-grey-500 mt-3 sm:mt-4 block"
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    lineHeight: 1.4
                  }}
                >
                  Join 10,000+ farmers already improving their coffee plant health
                </Typography>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Belowimg;