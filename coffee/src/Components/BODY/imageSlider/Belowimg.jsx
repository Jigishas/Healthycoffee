import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Shield, WandSparkles, Sprout, Coffee, TrendingUp, Target, BarChart, Users, Zap, CheckCircle, Droplets, Thermometer, Sun, Clock } from 'lucide-react';
import { Box, Typography, Grid, Container, Chip, Button, useTheme, useMediaQuery } from '@mui/material';

const BENEFITS = [
  { icon: Sprout, title: "Higher Yield Potential", description: "Healthy plants produce 30-50% more cherries", stats: "40% Increase", color: "#10b981", bgColor: "#ecfdf5", details: ["Better nutrient absorption", "Stronger root systems", "Optimal photosynthesis"] },
  { icon: Coffee, title: "Premium Quality Beans", description: "Improved bean density and flavor complexity", stats: "Grade AA Quality", color: "#f59e0b", bgColor: "#fffbeb", details: ["Higher cupping scores", "Better market price", "Export grade quality"] },
  { icon: Shield, title: "Disease Resistance", description: "Natural immunity against common pathogens", stats: "95% Prevention", color: "#3b82f6", bgColor: "#eff6ff", details: ["Leaf rust resistance", "Berry disease immunity", "Root rot prevention"] },
  { icon: TrendingUp, title: "Sustainable Income", description: "Stable yields ensure consistent farmer revenue", stats: "25% More Profit", color: "#22c55e", bgColor: "#f0fdf4", details: ["Reduced input costs", "Higher market value", "Long-term sustainability"] }
];

const AI_IMPACT = [
  { icon: WandSparkles, title: "Predictive Analysis", description: "AI forecasts disease outbreaks 2 weeks in advance", improvement: "90% Accuracy" },
  { icon: Target, title: "Precision Farming", description: "Optimal fertilizer and water recommendations", improvement: "40% Resource Saving" },
  { icon: BarChart, title: "Yield Optimization", description: "Data-driven pruning and harvesting schedules", improvement: "35% Yield Increase" },
  { icon: Zap, title: "Real-time Monitoring", description: "24/7 plant health tracking and alerts", improvement: "60% Faster Response" }
];

const GROWING_CONDITIONS = [
  { icon: Thermometer, label: "Temperature", value: "15-24°C", ideal: "Optimal for Arabica" },
  { icon: Droplets, label: "Rainfall", value: "1500-2500mm", ideal: "Well distributed" },
  { icon: Sun, label: "Sunlight", value: "Partial Shade", ideal: "4-6 hours daily" },
  { icon: Clock, label: "Maturation", value: "3-4 Years", ideal: "First harvest" }
];

const Belowimg = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      py: { xs: 6, sm: 8, md: 12, lg: 16 },
      px: { xs: 2, sm: 3, md: 4 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #f0f9ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh'
    }}>
      {/* Background Elements */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <Box sx={{ position: 'absolute', top: { xs: '-100px', md: '-80px' }, left: { xs: '-100px', md: '-80px' }, width: { xs: '200px', md: '300px', lg: '400px' }, height: { xs: '200px', md: '300px', lg: '400px' }, background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: { xs: '-100px', md: '-80px' }, right: { xs: '-100px', md: '-80px' }, width: { xs: '200px', md: '300px', lg: '400px' }, height: { xs: '200px', md: '300px', lg: '400px' }, background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
        
        {/* Coffee Leaf Pattern */}
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
          {[...Array(isMobile ? 8 : isTablet ? 12 : 15)].map((_, i) => (
            <Box key={i} sx={{ position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * (isMobile ? 20 : 30) + (isMobile ? 10 : 20)}px`, height: `${Math.random() * (isMobile ? 20 : 30) + (isMobile ? 10 : 20)}px`, transform: `rotate(${Math.random() * 360}deg)`, opacity: Math.random() * 0.3 + 0.1, color: '#10b981' }}>
              <Leaf style={{ width: '100%', height: '100%' }} />
            </Box>
          ))}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: { xs: 2, md: 3 }, mb: 4, p: { xs: 2, md: 3 }, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: { xs: '16px', md: '20px' }, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)' }}>
              <Leaf sx={{ color: 'white', width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 } }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '0.875rem', md: '1rem' } }}>Coffee Plant Health</Typography>
            </Box>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' }, fontWeight: 800, mb: 2, color: '#111827', lineHeight: 1.2 }}>Quality <Box component="span" sx={{ background: 'linear-gradient(135deg, #10b981 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Coffee Starts Here</Box></Typography>
            <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, color: '#6b7280', maxWidth: '800px', mx: 'auto', mb: 4, fontWeight: 400, lineHeight: 1.5 }}>Healthy plants = premium beans & sustainable yields</Typography>
          </Box>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <Box sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
            borderRadius: { xs: '20px', md: '32px' },
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Card Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              p: { xs: 3, md: 4 }
            }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant="h2"
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                      fontWeight: 700,
                      color: 'white',
                      mb: 2,
                      lineHeight: 1.2
                    }}
                  >
                    Plant Health Matters
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                      lineHeight: 1.5
                    }}
                  >
                    Healthy plants ensure high yields, quality beans & disease resistance
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
                  >
                    <Box sx={{ 
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        inset: '-12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(12px)'
                      }} />
                      <Box sx={{
                        position: 'relative',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        p: { xs: 4, md: 5 },
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        <Heart sx={{ 
                          color: 'white',
                          width: { xs: 48, md: 64 },
                          height: { xs: 48, md: 64 }
                        }} />
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
              <Box sx={{ mb: { xs: 6, md: 8 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <CheckCircle sx={{ color: '#10b981', width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }} />
                  <Typography variant="h3" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, fontWeight: 700, color: '#111827' }}>Key Benefits</Typography>
                </Box>

                <Grid container spacing={3}>
                  {BENEFITS.map((benefit, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5 }}>
                        <Box sx={{ height: '100%', background: benefit.bgColor, border: `2px solid ${benefit.color}20`, borderRadius: '16px', p: 2.5, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)', transform: 'translateY(-4px)' } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ p: 1.5, background: `linear-gradient(135deg, ${benefit.color} 0%, ${benefit.color}cc 100%)`, borderRadius: '12px' }}>
                              <Box sx={{ color: 'white' }}>{React.cloneElement(benefit.icon, { width: 18, height: 18 })}</Box>
                            </Box>
                            <Chip label={benefit.stats} sx={{ background: `${benefit.color}15`, color: benefit.color, fontWeight: 600, fontSize: '0.65rem', height: '22px' }} size="small" />
                          </Box>
                          <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' }, fontWeight: 700, color: benefit.color, mb: 1 }}>{benefit.title}</Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontSize: '0.8rem', lineHeight: 1.4 }}>{benefit.description}</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {benefit.details.map((detail, i) => (
                              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', background: benefit.color, flexShrink: 0 }} />
                                <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.7rem', lineHeight: 1.3 }}>{detail}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Growing Conditions */}
              <Box sx={{ mb: { xs: 8, md: 10 } }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 4
                }}>
                  <Target sx={{ 
                    color: '#10b981',
                    width: { xs: 24, md: 28 },
                    height: { xs: 24, md: 28 }
                  }} />
                  <Typography 
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#111827'
                    }}
                  >
                    Ideal Growing Conditions
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {GROWING_CONDITIONS.map((condition, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Box sx={{
                          background: 'white',
                          border: '1px solid rgba(16, 185, 129, 0.1)',
                          borderRadius: '16px',
                          p: 3,
                          textAlign: 'center',
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.2)'
                          }
                        }}>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                            borderRadius: '12px',
                            mb: 2
                          }}>
                            <Box sx={{ color: '#10b981' }}>
                              {React.cloneElement(condition.icon, {
                                width: isMobile ? 20 : 24,
                                height: isMobile ? 20 : 24
                              })}
                            </Box>
                          </Box>
                          <Typography 
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#374151',
                              mb: 0.5,
                              fontSize: '0.875rem'
                            }}
                          >
                            {condition.label}
                          </Typography>
                          <Typography 
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#10b981',
                              mb: 0.5,
                              fontSize: '1rem'
                            }}
                          >
                            {condition.value}
                          </Typography>
                          <Typography 
                            variant="caption"
                            sx={{
                              color: '#9ca3af',
                              fontSize: '0.75rem'
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

              <Box sx={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(245, 158, 11, 0.03) 100%)', borderRadius: '24px', p: { xs: 3, md: 4 }, border: '1px solid rgba(16, 185, 129, 0.1)', mb: { xs: 6, md: 8 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Box sx={{ p: 2, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '16px', flexShrink: 0 }}>
                    <WandSparkles sx={{ color: 'white', width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 } }} />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 700, color: '#111827', mb: 1 }}>AI-Driven Agricultural Revolution</Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '0.95rem' }}>Transforming coffee farming with intelligent technology</Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {AI_IMPACT.map((impact, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ x: 3 }}>
                        <Box sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px', p: 3, height: '100%', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 15px 40px -15px rgba(0, 0, 0, 0.1)' } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', borderRadius: '12px' }}>
                              <Box sx={{ color: '#8b5cf6' }}>{React.cloneElement(impact.icon, { width: isMobile ? 20 : 24, height: isMobile ? 20 : 24 })}</Box>
                            </Box>
                            <Chip label={impact.improvement} sx={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', color: '#7c3aed', fontWeight: 600, fontSize: '0.75rem' }} size="small" />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 1.5, fontSize: '1rem' }}>{impact.title}</Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.5 }}>{impact.description}</Typography>
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
                >
                  <Box sx={{
                    mt: 4,
                    pt: 4,
                    borderTop: '1px solid rgba(16, 185, 129, 0.1)'
                  }}>
                    <Typography 
                      variant="body1"
                      sx={{
                        color: '#374151',
                        textAlign: 'center',
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        lineHeight: 1.6
                      }}
                    >
                      <Box 
                        component="span"
                        sx={{ 
                          fontWeight: 600,
                          color: '#10b981'
                        }}
                      >
                        AI integration in coffee farming
                      </Box>{' '}
                      enables predictive disease detection, precision resource management, and yield optimization—ensuring 
                      healthier plants, better quality beans, and sustainable growth for East African coffee farmers.
                    </Typography>
                  </Box>
                </motion.div>
              </Box>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Box sx={{ 
                  textAlign: 'center',
                  mt: 6
                }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', mb: 2 }}>
                    <Button variant="contained" sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', fontWeight: 600, borderRadius: '12px', px: { xs: 4, md: 6 }, py: 2, fontSize: '0.95rem', textTransform: 'none', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', '&:hover': { boxShadow: '0 15px 35px -5px rgba(16, 185, 129, 0.5)', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>Learn Farming Best Practices</Button>
                    <Button variant="outlined" sx={{ border: '2px solid #10b981', color: '#10b981', fontWeight: 600, borderRadius: '12px', px: { xs: 4, md: 6 }, py: 2, fontSize: '0.95rem', textTransform: 'none', '&:hover': { background: 'rgba(16, 185, 129, 0.05)', border: '2px solid #059669' }, transition: 'all 0.3s ease' }}>Get AI Farming Tools</Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block' }}>Join 10,000+ farmers already improving their coffee plant health</Typography>
                </Box>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Belowimg;