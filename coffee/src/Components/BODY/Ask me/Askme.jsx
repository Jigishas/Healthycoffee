import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '../../ui/card';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '../../ui/accordion';
import { 
  Sprout, Coffee, Thermometer, CloudRain, Mountain, 
  Shield, TrendingUp, Leaf, Clock, Droplets, Sun,
  ChevronDown, Search, Filter, BookOpen, Target,
  BarChart, Zap, Users, TreePine, X
} from 'lucide-react';
import { 
  Box, Typography, Grid, Container, Chip,
  TextField, InputAdornment, Stack, IconButton
} from '@mui/material';

const Askme = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      id: 1,
      question: "What are the ideal growing conditions for coffee plants?",
      category: "cultivation",
      icon: <Sprout />,
      priority: "high",
      answer: (
        <Box>
          <Typography variant="body1" className="mb-4" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, lineHeight: 1.6 }}>
            Coffee plants thrive in specific conditions often called the "coffee belt" between the Tropics of Cancer and Capricorn. 
            Ideal conditions include:
          </Typography>
          <Grid container spacing={2} className="mb-4">
            {[
              {
                icon: <Thermometer />,
                title: "Temperature",
                content: (
                  <>
                    <strong>Arabica:</strong> 15-24°C (59-75°F)<br />
                    <strong>Robusta:</strong> 24-30°C (75-86°F)
                  </>
                ),
                color: "emerald"
              },
              {
                icon: <Mountain />,
                title: "Altitude",
                content: (
                  <>
                    <strong>Optimal:</strong> 600-2,000 meters<br />
                    <strong>Higher altitude</strong> = Better flavor complexity
                  </>
                ),
                color: "amber"
              },
              {
                icon: <CloudRain />,
                title: "Rainfall",
                content: (
                  <>
                    <strong>Required:</strong> 1,500-2,500 mm annually<br />
                    <strong>Distribution:</strong> Well-distributed throughout year
                  </>
                ),
                color: "blue"
              },
              {
                icon: <Droplets />,
                title: "Soil & Sun",
                content: (
                  <>
                    <strong>Soil pH:</strong> 6.0-6.5 (volcanic soil ideal)<br />
                    <strong>Sunlight:</strong> Partial shade, especially for young plants
                  </>
                ),
                color: "green"
              }
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border-${item.color}-200 p-3 sm:p-4 h-full`}>
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 text-${item.color}-600`}>
                      {React.cloneElement(item.icon, { className: "w-full h-full" })}
                    </div>
                    <Typography variant="h6" className={`font-semibold text-${item.color}-800`}
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {item.title}
                    </Typography>
                  </div>
                  <Typography variant="body2" 
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.4 }}>
                    {item.content}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    {
      id: 2,
      question: "How long does it take for a coffee plant to produce beans?",
      category: "growth",
      icon: <Clock />,
      priority: "high",
      answer: (
        <Box>
          <Grid container spacing={2} className="mb-4">
            {[
              { value: "3-4 Years", label: "Time to first harvest", color: "amber" },
              { value: "2,000 Cherries", label: "Annual yield per tree", color: "emerald" },
              { value: "15-25 Years", label: "Productive lifespan", color: "blue" }
            ].map((item, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <Card className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border-${item.color}-200 p-4 text-center h-full`}>
                  <Typography variant="h4" className={`font-black text-${item.color}-700 mb-2`}
                    sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
                    {item.value}
                  </Typography>
                  <Typography variant="body2" className={`text-${item.color}-800`}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {item.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, lineHeight: 1.6 }}>
            It typically takes 3 to 4 years for a newly planted coffee tree to begin bearing fruit. 
            The coffee cherries will initially be green and then turn red when ripe and ready for harvesting. 
            A single coffee tree can produce approximately 2,000 coffee cherries annually, which amounts to 
            about 4,000 beans or roughly one pound of roasted coffee.
          </Typography>
        </Box>
      )
    },
    {
      id: 3,
      question: "What's the difference between Arabica and Robusta coffee plants?",
      category: "varieties",
      icon: <Coffee />,
      priority: "high",
      answer: (
        <Box>
          <Typography variant="h6" className="font-semibold mb-4 text-emerald-800"
            sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Comparison of Coffee Varieties
          </Typography>
          <Grid container spacing={2} className="mb-6">
            {[
              {
                name: "Arabica",
                icon: <Coffee />,
                color: "emerald",
                details: {
                  market: "60-70%",
                  caffeine: "1.5%",
                  altitude: "600-2000m"
                },
                description: "Smooth, complex flavor with higher acidity. Premium quality, ideal for specialty coffee."
              },
              {
                name: "Robusta",
                icon: <Shield />,
                color: "amber",
                details: {
                  market: "30-40%",
                  caffeine: "2.7%",
                  altitude: "0-800m"
                },
                description: "Strong, bold flavor with higher caffeine. Disease-resistant, higher yields, easier to cultivate."
              },
              {
                name: "Liberica",
                icon: <Leaf />,
                color: "blue",
                details: {
                  market: "<2%",
                  caffeine: "Unique",
                  altitude: "Heat Tolerant"
                },
                description: "Unique floral aroma with woody, smoky flavor. Rare variety, heat tolerant, disease resistant."
              }
            ].map((variety, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card className={`bg-gradient-to-br from-${variety.color}-50 to-${variety.color}-100 border-${variety.color}-200 h-full`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-2 bg-${variety.color}-100 rounded-lg flex-shrink-0`}>
                        <div className="w-5 h-5 sm:w-6 sm:h-6">
                          {React.cloneElement(variety.icon, { className: `text-${variety.color}-600 w-full h-full` })}
                        </div>
                      </div>
                      <Typography variant="h5" className={`font-bold text-${variety.color}-800`}
                        sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                        {variety.name}
                      </Typography>
                    </div>
                    <Stack spacing={1.5} sx={{ '& > *': { minHeight: '32px' } }}>
                      {Object.entries(variety.details).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Typography variant="body2" className="text-grey-600"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Typography>
                          <Chip 
                            label={value} 
                            size="small" 
                            className={`bg-${variety.color}-100 text-${variety.color}-800`}
                            sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                        </div>
                      ))}
                      <Typography variant="body2" className="text-grey-700 mt-2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.4 }}>
                        {variety.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    // Additional FAQ items...
    {
      id: 4,
      question: "What are the main challenges in coffee farming?",
      category: "challenges",
      icon: <Shield />,
      priority: "medium",
      answer: "Detailed answer about challenges..."
    },
    {
      id: 5,
      question: "What is shade-grown coffee and why is it important?",
      category: "sustainability",
      icon: <TreePine />,
      priority: "medium",
      answer: "Detailed answer about shade-grown coffee..."
    },
    {
      id: 6,
      question: "How does altitude affect coffee flavor?",
      category: "quality",
      icon: <Mountain />,
      priority: "high",
      answer: "Detailed answer about altitude effects..."
    },
    {
      id: 7,
      question: "How are coffee beans harvested and processed?",
      category: "processing",
      icon: <Zap />,
      priority: "high",
      answer: "Detailed answer about harvesting..."
    },
    {
      id: 8,
      question: "What is the coffee cherry and how is it structured?",
      category: "basics",
      icon: <Sprout />,
      priority: "medium",
      answer: "Detailed answer about coffee cherry..."
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: <BookOpen />, count: faqData.length },
    { id: 'cultivation', label: 'Cultivation', icon: <Sprout />, count: faqData.filter(f => f.category === 'cultivation').length },
    { id: 'growth', label: 'Growth', icon: <TrendingUp />, count: faqData.filter(f => f.category === 'growth').length },
    { id: 'varieties', label: 'Varieties', icon: <Coffee />, count: faqData.filter(f => f.category === 'varieties').length },
    { id: 'challenges', label: 'Challenges', icon: <Shield />, count: faqData.filter(f => f.category === 'challenges').length },
    { id: 'quality', label: 'Quality', icon: <Target />, count: faqData.filter(f => f.category === 'quality').length },
    { id: 'sustainability', label: 'Sustainable', icon: <Leaf />, count: faqData.filter(f => f.category === 'sustainability').length },
  ];

  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ 
      py: { xs: 6, sm: 8, md: 12 }, 
      px: { xs: 1, sm: 2, md: 4 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #fef3c7 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-emerald-300 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-amber-300 to-transparent rounded-full blur-3xl" />
      </div>

      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 relative z-10"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </div>
            <Typography 
              variant="h5" 
              className="font-bold text-emerald-700"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                whiteSpace: 'nowrap'
              }}
            >
              Coffee Farming Knowledge Base
            </Typography>
          </div>

          <Typography 
            variant="h1" 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4"
            sx={{ 
              color: 'grey.900',
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
              px: { xs: 1, sm: 0 }
            }}
          >
            Expert Answers for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Coffee Farmers
            </span>
          </Typography>

          <Typography 
            variant="h6" 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-grey-600 max-w-3xl mx-auto mb-6 sm:mb-8"
            sx={{ 
              fontWeight: 400,
              lineHeight: 1.5,
              px: { xs: 1, sm: 0 }
            }}
          >
            Practical solutions and expert advice for successful coffee cultivation in East Africa
          </Typography>

          {/* Search Bar */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto px-2 sm:px-0"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search coffee farming questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-grey-400" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setSearchQuery('')}
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <X className="w-4 h-4 text-grey-400" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  height: { xs: 44, sm: 48 }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  borderColor: 'rgb(209, 213, 219)',
                  '&:hover': {
                    borderColor: 'rgb(16, 185, 129)',
                  },
                  '&.Mui-focused': {
                    borderColor: 'rgb(16, 185, 129)',
                    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.1)',
                  },
                },
              }}
            />
          </motion.div>
        </motion.div>

        {/* Categories - Horizontal Scroll for Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6 sm:mb-8 relative z-10"
        >
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 px-2 sm:px-0 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md sm:shadow-lg'
                    : 'bg-white text-grey-700 border border-grey-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <span className="text-base sm:text-lg">{cat.icon}</span>
                <span className="text-xs sm:text-sm whitespace-nowrap">{cat.label}</span>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeCategory === cat.id
                    ? 'bg-white/20'
                    : 'bg-grey-100 text-grey-600'
                }`}>
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10"
        >
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence>
              {filteredFaqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    openItems.includes(faq.id)
                      ? 'border-emerald-300 shadow-lg sm:shadow-2xl'
                      : 'border-grey-100 hover:border-emerald-200 hover:shadow-sm sm:hover:shadow-lg'
                  }`}>
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-4 sm:p-6 text-left bg-gradient-to-r from-white to-grey-50 hover:from-emerald-50 hover:to-emerald-50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${
                            openItems.includes(faq.id)
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            <div className="w-4 h-4 sm:w-5 sm:h-5">
                              {React.cloneElement(faq.icon, { className: "w-full h-full" })}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Typography variant="h5" className="font-bold text-grey-900 mb-1 truncate"
                              sx={{ 
                                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                                lineHeight: 1.3
                              }}>
                              {faq.question}
                            </Typography>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Chip
                                label={faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                                size="small"
                                className="bg-emerald-100 text-emerald-800"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                  height: { xs: 20, sm: 24 }
                                }}
                              />
                              {faq.priority === 'high' && (
                                <Chip
                                  label="Important"
                                  size="small"
                                  className="bg-amber-100 text-amber-800"
                                  sx={{ 
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                    height: { xs: 20, sm: 24 }
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: openItems.includes(faq.id) ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0 ml-2"
                        >
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-grey-400" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {openItems.includes(faq.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="p-4 sm:p-6 bg-white">
                            {faq.answer}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredFaqs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-grey-100 to-grey-200 flex items-center justify-center">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-grey-400" />
                </div>
                <Typography variant="h5" className="font-semibold text-grey-700 mb-2"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  No questions found
                </Typography>
                <Typography variant="body1" className="text-grey-500 max-w-md mx-auto"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, px: 2 }}>
                  Try a different search term or browse all categories
                </Typography>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Tips - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-8 sm:mt-12 relative z-10"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h3" className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4"
                    sx={{ lineHeight: { xs: 1.3, sm: 1.4 } }}>
                    Need Immediate Farming Advice?
                  </Typography>
                  <Typography variant="body1" className="text-emerald-100 mb-4 sm:mb-6"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: 1.5
                    }}>
                    Connect with our agricultural experts for personalized guidance on your coffee farm.
                  </Typography>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-emerald-700 font-semibold rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-md sm:shadow-lg text-sm sm:text-base">
                      Contact Expert
                    </button>
                    <button className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-white text-white font-semibold rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 text-sm sm:text-base">
                      Download Farming Guide
                    </button>
                  </div>
                </Grid>
                <Grid item xs={12} md={4}>
                  <div className="relative mt-4 sm:mt-0">
                    <div className="absolute -inset-2 sm:-inset-4 bg-white/10 rounded-xl sm:rounded-3xl blur-xl" />
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <Typography variant="h6" className="font-semibold text-white"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
                          Expert Support
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-emerald-100"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.4 }}>
                        24/7 access to coffee farming specialists
                      </Typography>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Askme;