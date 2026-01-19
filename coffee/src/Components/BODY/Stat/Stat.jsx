import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Sprout, Coffee, TrendingUp, 
  Shield, Droplets, Thermometer, BarChart, Target,
  Cloud, Zap, Leaf, TreePine
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Card, CardContent } from '../../ui/card';
import { Typography, Grid, Container, Box } from '@mui/material';

// Enhanced Counter animation component with farmer-friendly formatting
const AnimatedCounter = ({ from, to, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      onUpdate: (value) => setCount(Math.floor(value)),
      ease: "easeOut"
    });

    return controls.stop;
  }, [from, to, duration]);

  const formattedCount = to >= 1000 
    ? `${(count / 1000).toFixed(1)}K+`
    : count;

  return <span>{formattedCount}{suffix}</span>;
};

const Stat = () => {
  const [activeStat, setActiveStat] = useState(null);

  // Enhanced stats with farmer-relevant data
  const stats = [
    {
      icon: Sprout,
      value: 700,
      suffix: 'K+',
      label: "Active Coffee Farmers",
      description: "Registered farmers across East Africa",
      color: "emerald",
      details: [
        "Kenya: 300K+ farmers",
        "Ethiopia: 250K+ farmers",
        "Tanzania: 150K+ farmers"
      ],
      growth: "+5.2% this year"
    },
    {
      icon: Coffee,
      value: 850,
      suffix: 'K',
      label: "Tonnes Produced Annually",
      description: "Total coffee production in East Africa",
      color: "amber",
      details: [
        "Arabica: 600K tonnes",
        "Robusta: 250K tonnes",
        "Export quality: 85%"
      ],
      growth: "+3.8% annual increase"
    },
    {
      icon: Shield,
      value: 95,
      suffix: '%',
      label: "Disease Prevention Success",
      description: "Effective treatment and prevention",
      color: "blue",
      details: [
        "Coffee Berry Disease: 92% success",
        "Leaf Rust: 96% success",
        "Wilt Disease: 97% success"
      ],
      growth: "Improved by 15% in 3 years"
    },
    {
      icon: TrendingUp,
      value: 40,
      suffix: '%',
      label: "Income Increase",
      description: "Average farmer income growth",
      color: "green",
      details: [
        "Premium Arabica: +45%",
        "Organic farming: +55%",
        "Direct trade: +60%"
      ],
      growth: "Sustainable growth trajectory"
    },
    {
      icon: Users,
      value: 200,
      suffix: 'K+',
      label: "Cooperative Members",
      description: "Farmers in registered cooperatives",
      color: "purple",
      details: [
        "Better pricing through unity",
        "Collective bargaining power",
        "Shared resources & knowledge"
      ],
      growth: "+12K new members this year"
    },
    {
      icon: Activity,
      value: 98,
      suffix: '%',
      label: "Crop Survival Rate",
      description: "Healthy plant maintenance success",
      color: "teal",
      details: [
        "Proper pruning: 99% success",
        "Optimal spacing: 97% success",
        "Soil management: 96% success"
      ],
      growth: "Consistently above 95%"
    }
  ];

  // Color mapping
  const colorConfig = {
    emerald: {
      bg: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      hoverBorder: "hover:border-emerald-400",
      text: "text-emerald-700",
      accent: "text-emerald-600",
      gradient: "from-emerald-500 to-emerald-600"
    },
    amber: {
      bg: "from-amber-50 to-amber-100",
      border: "border-amber-200",
      hoverBorder: "hover:border-amber-400",
      text: "text-amber-700",
      accent: "text-amber-600",
      gradient: "from-amber-500 to-amber-600"
    },
    blue: {
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      hoverBorder: "hover:border-blue-400",
      text: "text-blue-700",
      accent: "text-blue-600",
      gradient: "from-blue-500 to-blue-600"
    },
    green: {
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      hoverBorder: "hover:border-green-400",
      text: "text-green-700",
      accent: "text-green-600",
      gradient: "from-green-500 to-green-600"
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      hoverBorder: "hover:border-purple-400",
      text: "text-purple-700",
      accent: "text-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
    teal: {
      bg: "from-teal-50 to-teal-100",
      border: "border-teal-200",
      hoverBorder: "hover:border-teal-400",
      text: "text-teal-700",
      accent: "text-teal-600",
      gradient: "from-teal-500 to-teal-600"
    }
  };

  return (
    <Box sx={{ 
      py: { xs: 12, md: 16 }, 
      px: { xs: 2, sm: 4 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #f0f9ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full blur-3xl" />
        
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16 relative z-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl">
              <BarChart className="w-8 h-8 text-white" />
            </div>
            <Typography 
              variant="h5" 
              className="font-bold text-emerald-700"
              sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Coffee Farming Statistics
            </Typography>
          </div>

          <Typography 
            variant="h2" 
            className="text-3xl md:text-5xl font-black mb-4"
            sx={{ color: 'grey.900' }}
          >
            East Africa's Coffee{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              By The Numbers
            </span>
          </Typography>

          <Typography 
            variant="h6" 
            className="text-lg md:text-xl text-grey-600 max-w-3xl mx-auto"
            sx={{ fontWeight: 400 }}
          >
            Real data showing the growth, success, and opportunities in coffee farming across our region
          </Typography>
        </motion.div>

        {/* Stats Grid */}
        <Grid container spacing={3} className="relative z-10">
          {stats.map((stat, index) => {
            const colors = colorConfig[stat.color];
            
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-3xl p-6 h-full transition-all duration-300 ${colors.hoverBorder} shadow-xl hover:shadow-2xl cursor-pointer relative overflow-hidden group`}
                    onMouseEnter={() => setActiveStat(index)}
                    onMouseLeave={() => setActiveStat(null)}
                  >
                    {/* Animated Border */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                    />

                    {/* Content */}
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-white/80 ${colors.text}`}>
                          <stat.icon className="w-8 h-8" />
                        </div>
                        
                        {/* Growth Indicator */}
                        <div className="flex items-center gap-1 px-3 py-1 bg-white/90 rounded-full">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600">
                            {stat.growth}
                          </span>
                        </div>
                      </div>

                      {/* Main Value */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <Typography 
                            variant="h2" 
                            className={`text-4xl md:text-5xl font-black ${colors.accent}`}
                          >
                            <AnimatedCounter 
                              from={0} 
                              to={stat.value} 
                              duration={2}
                            />
                          </Typography>
                          {stat.suffix && (
                            <Typography 
                              variant="h4" 
                              className={`text-2xl font-bold ${colors.accent}`}
                            >
                              {stat.suffix}
                            </Typography>
                          )}
                        </div>
                      </div>

                      {/* Label */}
                      <Typography 
                        variant="h5" 
                        className={`font-bold mb-2 ${colors.text}`}
                        sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                      >
                        {stat.label}
                      </Typography>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        className="text-grey-600 mb-4"
                      >
                        {stat.description}
                      </Typography>

                      {/* Details (Shown on Hover) */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: activeStat === index ? 'auto' : 0,
                          opacity: activeStat === index ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-white/50">
                          <Typography 
                            variant="body2" 
                            className="font-semibold text-grey-700 mb-2"
                          >
                            Details:
                          </Typography>
                          <ul className="space-y-1">
                            {stat.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${colors.accent.replace('text', 'bg')}`} />
                                <Typography variant="body2" className="text-grey-600">
                                  {detail}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>

                      {/* Pulse Animation */}
                      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-md group-hover:scale-150 transition-transform duration-300" />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Key Insights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 relative z-10"
        >
          <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 rounded-3xl p-6 md:p-8 border border-emerald-200/50 backdrop-blur-sm">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-emerald-800">
                      Key Insight
                    </Typography>
                    <Typography variant="body2" className="text-grey-600">
                      Farmers in cooperatives earn 30% more
                    </Typography>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-amber-800">
                      Sustainable Growth
                    </Typography>
                    <Typography variant="body2" className="text-grey-600">
                      Organic farming adoption up by 45%
                    </Typography>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                    <TreePine className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-blue-800">
                      Future Projection
                    </Typography>
                    <Typography variant="body2" className="text-grey-600">
                      Expected 25% growth in next 5 years
                    </Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-12 text-center relative z-10"
        >
          <Typography 
            variant="body1" 
            className="text-grey-600 mb-6 max-w-2xl mx-auto"
          >
            These numbers show the incredible potential of coffee farming in East Africa. 
            Join thousands of successful farmers today.
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Start Your Coffee Farm
            </button>
            <button className="px-8 py-3 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300">
              View Market Analysis
            </button>
          </div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Stat;