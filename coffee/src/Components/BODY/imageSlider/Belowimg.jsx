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
      py: { xs: 12, md: 16 }, 
      px: { xs: 2, sm: 4 },
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
          {[...Array(15)].map((_, i) => (
            <Leaf
              key={i}
              className="absolute text-emerald-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.3 + 0.1
              }}
            />
          ))}
        </div>
      </div>

      <Container maxWidth="xl" className="relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <Typography 
              variant="h5" 
              className="font-bold text-emerald-700"
              sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Coffee Plant Health
            </Typography>
          </div>

          <Typography 
            variant="h1" 
            className="text-3xl md:text-5xl font-black mb-4"
            sx={{ color: 'grey.900' }}
          >
            The Foundation of{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Quality Coffee
            </span>
          </Typography>

          <Typography 
            variant="h6" 
            className="text-lg md:text-xl text-grey-600 max-w-4xl mx-auto mb-8"
            sx={{ fontWeight: 400 }}
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
            <Box className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 md:p-12">
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant="h2" 
                    className="text-2xl md:text-4xl font-bold text-white mb-4"
                  >
                    Why Plant Health Matters
                  </Typography>
                  <Typography variant="body1" className="text-emerald-100 leading-relaxed">
                    A healthy coffee plant is the foundation of the entire industry. It ensures high yields of quality 
                    beans, supports farmer livelihoods, and provides natural resistance against pests and diseases—vital 
                    for sustainable coffee production in East Africa.
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
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl" />
                      <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                        <Heart className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            {/* Benefits Section */}
            <Box className="p-8 md:p-12">
              <Typography 
                variant="h3" 
                className="text-xl md:text-2xl font-bold text-grey-900 mb-8 flex items-center gap-3"
              >
                <CheckCircle className="w-7 h-7 text-emerald-500" />
                Key Benefits of Healthy Coffee Plants
              </Typography>

              <Grid container spacing={4} className="mb-12">
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -8 }}
                    >
                      <Box className={`bg-gradient-to-br from-${benefit.color}-50 to-${benefit.color}-100 border-2 border-${benefit.color}-200 rounded-3xl p-6 h-full transition-all duration-300 hover:shadow-2xl`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 bg-gradient-to-r from-${benefit.color}-500 to-${benefit.color}-600 rounded-2xl`}>
                            <div className="text-white">
                              {benefit.icon}
                            </div>
                          </div>
                          <Chip 
                            label={benefit.stats}
                            className={`bg-${benefit.color}-100 text-${benefit.color}-800 font-semibold`}
                            size="small"
                          />
                        </div>
                        
                        <Typography variant="h5" className={`font-bold text-${benefit.color}-800 mb-2`}>
                          {benefit.title}
                        </Typography>
                        
                        <Typography variant="body2" className="text-grey-600 mb-4">
                          {benefit.description}
                        </Typography>
                        
                        <div className="space-y-2">
                          {benefit.details.map((detail, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full bg-${benefit.color}-500`} />
                              <Typography variant="caption" className="text-grey-700">
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
              <Box className="mb-12">
                <Typography 
                  variant="h3" 
                  className="text-xl md:text-2xl font-bold text-grey-900 mb-8 flex items-center gap-3"
                >
                  <Target className="w-7 h-7 text-emerald-500" />
                  Ideal Growing Conditions
                </Typography>
                
                <Grid container spacing={3}>
                  {growingConditions.map((condition, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Box className="bg-white border border-emerald-100 rounded-2xl p-4 text-center hover:shadow-lg transition-shadow duration-300">
                          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl mb-3">
                            <div className="text-emerald-600">
                              {condition.icon}
                            </div>
                          </div>
                          <Typography variant="body2" className="font-semibold text-grey-700 mb-1">
                            {condition.label}
                          </Typography>
                          <Typography variant="h6" className="font-bold text-emerald-700 mb-1">
                            {condition.value}
                          </Typography>
                          <Typography variant="caption" className="text-grey-500">
                            {condition.ideal}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* AI Impact Section */}
              <Box className="bg-gradient-to-r from-emerald-500/5 to-amber-500/5 rounded-3xl p-8 border border-emerald-200">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                    <WandSparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography variant="h3" className="text-xl md:text-2xl font-bold text-grey-900">
                      AI-Driven Agricultural Revolution
                    </Typography>
                    <Typography variant="body1" className="text-grey-600">
                      Transforming coffee farming with intelligent technology
                    </Typography>
                  </div>
                </div>

                <Grid container spacing={4}>
                  {aiImpact.map((impact, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 5 }}
                      >
                        <Box className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                              <div className="text-purple-600">
                                {impact.icon}
                              </div>
                            </div>
                            <Chip 
                              label={impact.improvement}
                              className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 font-semibold"
                              size="small"
                            />
                          </div>
                          
                          <Typography variant="h6" className="font-bold text-grey-900 mb-2">
                            {impact.title}
                          </Typography>
                          
                          <Typography variant="body2" className="text-grey-600">
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
                  className="mt-8 pt-8 border-t border-emerald-200"
                >
                  <Typography variant="body1" className="text-grey-700 leading-relaxed text-center">
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
                className="mt-12 text-center"
              >
                <Box className="inline-flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    Learn Farming Best Practices
                  </button>
                  <button className="px-8 py-3 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300">
                    Get AI Farming Tools
                  </button>
                </Box>
                
                <Typography variant="caption" className="text-grey-500 mt-4 block">
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