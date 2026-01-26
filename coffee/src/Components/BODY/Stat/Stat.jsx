import React, { useState, useEffect } from 'react';
import { Activity, Users, Sprout, Coffee, TrendingUp, Shield, BarChart, Target, Leaf, TreePine } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import { Card, CardContent } from '../../ui/card';
import { Typography, Grid, Container, Box } from '@mui/material';

const AnimatedCounter = ({ from, to, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(from);
  useEffect(() => { const controls = animate(from, to, { duration, onUpdate: (value) => setCount(Math.floor(value)), ease: "easeOut" }); return controls.stop; }, [from, to, duration]);
  const formattedCount = to >= 1000 ? `${(count / 1000).toFixed(1)}K+` : count;
  return <span>{formattedCount}{suffix}</span>;
};

const COLOR_CONFIG = {
  emerald: { bg: "from-emerald-50 to-emerald-100", border: "border-emerald-200", text: "text-emerald-700", accent: "text-emerald-600" },
  amber: { bg: "from-amber-50 to-amber-100", border: "border-amber-200", text: "text-amber-700", accent: "text-amber-600" },
  blue: { bg: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-700", accent: "text-blue-600" },
  green: { bg: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-700", accent: "text-green-600" },
  purple: { bg: "from-purple-50 to-purple-100", border: "border-purple-200", text: "text-purple-700", accent: "text-purple-600" },
  teal: { bg: "from-teal-50 to-teal-100", border: "border-teal-200", text: "text-teal-700", accent: "text-teal-600" }
};

const STATS = [
  { icon: Sprout, value: 700, suffix: 'K+', label: "Active Coffee Farmers", description: "Registered farmers across East Africa", color: "emerald", details: ["Kenya: 300K+ farmers", "Ethiopia: 250K+ farmers", "Tanzania: 150K+ farmers"], growth: "+5.2% this year" },
  { icon: Coffee, value: 850, suffix: 'K', label: "Tonnes Produced", description: "Total coffee production annually", color: "amber", details: ["Arabica: 600K tonnes", "Robusta: 250K tonnes", "Export quality: 85%"], growth: "+3.8% annual increase" },
  { icon: Shield, value: 95, suffix: '%', label: "Disease Prevention", description: "Effective treatment and prevention", color: "blue", details: ["Coffee Berry Disease: 92%", "Leaf Rust: 96% success", "Wilt Disease: 97% success"], growth: "Improved by 15% in 3 years" },
  { icon: TrendingUp, value: 40, suffix: '%', label: "Income Increase", description: "Average farmer income growth", color: "green", details: ["Premium Arabica: +45%", "Organic farming: +55%", "Direct trade: +60%"], growth: "Sustainable growth" },
  { icon: Users, value: 200, suffix: 'K+', label: "Cooperative Members", description: "Farmers in cooperatives", color: "purple", details: ["Better pricing through unity", "Collective bargaining power", "Shared resources"], growth: "+12K new members" },
  { icon: Activity, value: 98, suffix: '%', label: "Crop Survival Rate", description: "Healthy plant maintenance", color: "teal", details: ["Proper pruning: 99% success", "Optimal spacing: 97% success", "Soil management: 96% success"], growth: "Consistently above 95%" }
];

const Stat = () => {
  const [activeStat, setActiveStat] = useState(null);
  const [touchActive, setTouchActive] = useState(null);
  const handleTouchStart = (index) => { setTouchActive(index); setActiveStat(index); };
  const handleTouchEnd = () => { setTimeout(() => { setTouchActive(null); setActiveStat(null); }, 300); };

  return (
    <Box sx={{ py: { xs: 8, sm: 10, md: 16 }, px: { xs: 1, sm: 2, md: 4 }, background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #f0f9ff 100%)', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 sm:-top-20 -left-12 sm:-left-20 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-12 sm:-bottom-20 -right-12 sm:-right-20 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (<div key={i} className="absolute w-2 h-2 bg-emerald-400 rounded-full" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />))}
        </div>
      </div>

      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12 md:mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl">
              <BarChart className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </div>
            <Typography variant="h5" className="font-bold text-emerald-700 whitespace-nowrap" sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>Coffee Farming Statistics</Typography>
          </div>
          <Typography variant="h2" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4" sx={{ color: 'grey.900', lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }, px: { xs: 1, sm: 0 } }}>East Africa's Coffee <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">By The Numbers</span></Typography>
          <Typography variant="h6" className="text-sm sm:text-base md:text-lg lg:text-xl text-grey-600 mx-auto" sx={{ fontWeight: 400, maxWidth: '95%', lineHeight: 1.5, px: { xs: 1, sm: 0 } }}>Real data showing growth, success, and opportunities in coffee farming</Typography>
        </motion.div>

        <Grid container spacing={2} sm={3} className="relative z-10" sx={{ justifyContent: 'center' }}>
          {STATS.map((stat, index) => {
            const colors = COLOR_CONFIG[stat.color];
            const isActive = activeStat === index || touchActive === index;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true, margin: "-30px" }} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} onTouchStart={() => handleTouchStart(index)} onTouchEnd={handleTouchEnd} onMouseEnter={() => setActiveStat(index)} onMouseLeave={() => setActiveStat(null)}>
                  <Card className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group touch-pan-y`}>
                    <motion.div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }} viewport={{ once: true }} />
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 ${colors.text}`}>
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"><stat.icon className="w-full h-full" /></div>
                        </div>
                        <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white/90 rounded-full">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          <span className="text-xs sm:text-sm font-semibold text-green-600 whitespace-nowrap">{stat.growth}</span>
                        </div>
                      </div>
                      <div className="mb-2 sm:mb-3">
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <Typography variant="h2" className={`font-black ${colors.accent}`} sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, lineHeight: 1 }}><AnimatedCounter from={0} to={stat.value} duration={2} /></Typography>
                          {stat.suffix && <Typography variant="h4" className={`font-bold ${colors.accent}`} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>{stat.suffix}</Typography>}
                        </div>
                      </div>
                      <Typography variant="h5" className={`font-bold mb-1 sm:mb-2 ${colors.text}`} sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, lineHeight: 1.2 }}>{stat.label}</Typography>
                      <Typography variant="body2" className="text-grey-600 mb-3 sm:mb-4" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.3 }}>{stat.description}</Typography>
                      <div className="sm:hidden flex justify-center mb-2">
                        <Typography variant="caption" className="text-grey-500 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Tap for details</Typography>
                      </div>
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="pt-3 sm:pt-4 border-t border-white/50">
                          <Typography variant="body2" className="font-semibold text-grey-700 mb-1 sm:mb-2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Details:</Typography>
                          <ul className="space-y-1">
                            {stat.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${colors.accent.replace('text', 'bg')}`} />
                                <Typography variant="body2" className="text-grey-600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.3 }}>{detail}</Typography>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                      <div className="absolute -bottom-1 -right-1 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-md group-hover:scale-150 transition-transform duration-300" />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} viewport={{ once: true }} className="mt-8 sm:mt-12 relative z-10">
          <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 backdrop-blur-sm">
            <Grid container spacing={3} sm={2} alignItems="center">
              {[{ icon: Target, color: 'emerald', title: 'Key Insight', text: 'Farmers in cooperatives earn 30% more' }, { icon: Leaf, color: 'amber', title: 'Sustainable Growth', text: 'Organic farming adoption up by 45%' }, { icon: TreePine, color: 'blue', title: 'Future Projection', text: 'Expected 25% growth in next 5 years' }].map((item, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <div className={`flex items-center gap-3 sm:gap-4 ${i > 0 ? 'mb-4 sm:mb-0' : ''}`}>
                    <div className={`p-2 sm:p-3 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-xl sm:rounded-2xl flex-shrink-0`}>
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="min-w-0">
                      <Typography variant="h6" className={`font-bold text-${item.color}-800 truncate`} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{item.title}</Typography>
                      <Typography variant="body2" className="text-grey-600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{item.text}</Typography>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} viewport={{ once: true }} className="mt-8 sm:mt-12 text-center relative z-10">
          <Typography variant="body1" className="text-grey-600 mb-4 sm:mb-6 mx-auto" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, maxWidth: { xs: '95%', sm: '2xl' }, lineHeight: 1.5, px: { xs: 1, sm: 0 } }}>These numbers show the incredible potential of coffee farming in East Africa. Join thousands of successful farmers today.</Typography>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button onClick={() => document.getElementById('camera')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">Start Your Coffee Farm</button>
            <button onClick={() => window.open('/market-analysis', '_blank')} className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all duration-300 text-sm sm:text-base">View Market Analysis</button>
          </div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Stat;