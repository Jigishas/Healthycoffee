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
  BarChart, Zap, Users, TreePine
} from 'lucide-react';
import { 
  Box, Typography, Grid, Container, Chip,
  TextField, InputAdornment, Stack
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
          <Typography variant="body1" className="mb-4">
            Coffee plants thrive in specific conditions often called the "coffee belt" between the Tropics of Cancer and Capricorn. 
            Ideal conditions include:
          </Typography>
          <Grid container spacing={2} className="mb-4">
            <Grid item xs={12} md={6}>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Thermometer className="w-6 h-6 text-emerald-600" />
                  <Typography variant="h6" className="font-semibold text-emerald-800">
                    Temperature
                  </Typography>
                </div>
                <Typography variant="body2">
                  <strong>Arabica:</strong> 15-24°C (59-75°F)<br />
                  <strong>Robusta:</strong> 24-30°C (75-86°F)
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Mountain className="w-6 h-6 text-amber-600" />
                  <Typography variant="h6" className="font-semibold text-amber-800">
                    Altitude
                  </Typography>
                </div>
                <Typography variant="body2">
                  <strong>Optimal:</strong> 600-2,000 meters<br />
                  <strong>Higher altitude</strong> = Better flavor complexity
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CloudRain className="w-6 h-6 text-blue-600" />
                  <Typography variant="h6" className="font-semibold text-blue-800">
                    Rainfall
                  </Typography>
                </div>
                <Typography variant="body2">
                  <strong>Required:</strong> 1,500-2,500 mm annually<br />
                  <strong>Distribution:</strong> Well-distributed throughout year
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Droplets className="w-6 h-6 text-green-600" />
                  <Typography variant="h6" className="font-semibold text-green-800">
                    Soil & Sun
                  </Typography>
                </div>
                <Typography variant="body2">
                  <strong>Soil pH:</strong> 6.0-6.5 (volcanic soil ideal)<br />
                  <strong>Sunlight:</strong> Partial shade, especially for young plants
                </Typography>
              </Card>
            </Grid>
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
          <Grid container spacing={3} className="mb-4">
            <Grid item xs={12} md={4}>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 p-4 text-center">
                <Typography variant="h4" className="font-black text-amber-700 mb-2">
                  3-4 Years
                </Typography>
                <Typography variant="body2" className="text-amber-800">
                  Time to first harvest
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 p-4 text-center">
                <Typography variant="h4" className="font-black text-emerald-700 mb-2">
                  2,000 Cherries
                </Typography>
                <Typography variant="body2" className="text-emerald-800">
                  Annual yield per tree
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-4 text-center">
                <Typography variant="h4" className="font-black text-blue-700 mb-2">
                  15-25 Years
                </Typography>
                <Typography variant="body2" className="text-blue-800">
                  Productive lifespan
                </Typography>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="body1">
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
          <Typography variant="h6" className="font-semibold mb-4 text-emerald-800">
            Comparison of Coffee Varieties
          </Typography>
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} md={4}>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Coffee className="w-6 h-6 text-emerald-600" />
                    </div>
                    <Typography variant="h5" className="font-bold text-emerald-800">
                      Arabica
                    </Typography>
                  </div>
                  <Stack spacing={2}>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Global Market</Typography>
                      <Chip label="60-70%" size="small" className="bg-emerald-100 text-emerald-800" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Caffeine Content</Typography>
                      <Chip label="1.5%" size="small" className="bg-emerald-100 text-emerald-800" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Altitude</Typography>
                      <Chip label="600-2000m" size="small" className="bg-emerald-100 text-emerald-800" />
                    </div>
                    <Typography variant="body2" className="text-grey-700">
                      Smooth, complex flavor with higher acidity. Premium quality, ideal for specialty coffee.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                    <Typography variant="h5" className="font-bold text-amber-800">
                      Robusta
                    </Typography>
                  </div>
                  <Stack spacing={2}>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Global Market</Typography>
                      <Chip label="30-40%" size="small" className="bg-amber-100 text-amber-800" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Caffeine Content</Typography>
                      <Chip label="2.7%" size="small" className="bg-amber-100 text-amber-800" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Altitude</Typography>
                      <Chip label="0-800m" size="small" className="bg-amber-100 text-amber-800" />
                    </div>
                    <Typography variant="body2" className="text-grey-700">
                      Strong, bold flavor with higher caffeine. Disease-resistant, higher yields, easier to cultivate.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Leaf className="w-6 h-6 text-blue-600" />
                    </div>
                    <Typography variant="h5" className="font-bold text-blue-800">
                      Liberica
                    </Typography>
                  </div>
                  <Stack spacing={2}>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Global Market</Typography>
                      <Chip label="<2%" size="small" className="bg-blue-100 text-blue-800" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Flavor Profile</Typography>
                      <Chip label="Unique" size="small" className="bg-blue-100 text-blue-800" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="text-grey-600">Climate</Typography>
                      <Chip label="Heat Tolerant" size="small" className="bg-blue-100 text-blue-800" />
                    </div>
                    <Typography variant="body2" className="text-grey-700">
                      Unique floral aroma with woody, smoky flavor. Rare variety, heat tolerant, disease resistant.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )
    },
    // Add more FAQ items following the same structure...
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
    { id: 'all', label: 'All Topics', icon: <BookOpen />, count: faqData.length },
    { id: 'cultivation', label: 'Cultivation', icon: <Sprout />, count: faqData.filter(f => f.category === 'cultivation').length },
    { id: 'growth', label: 'Growth Cycle', icon: <TrendingUp />, count: faqData.filter(f => f.category === 'growth').length },
    { id: 'varieties', label: 'Varieties', icon: <Coffee />, count: faqData.filter(f => f.category === 'varieties').length },
    { id: 'challenges', label: 'Challenges', icon: <Shield />, count: faqData.filter(f => f.category === 'challenges').length },
    { id: 'quality', label: 'Quality Factors', icon: <Target />, count: faqData.filter(f => f.category === 'quality').length },
    { id: 'sustainability', label: 'Sustainability', icon: <Leaf />, count: faqData.filter(f => f.category === 'sustainability').length },
  ];

  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.props?.children?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ 
      py: { xs: 8, md: 12 }, 
      px: { xs: 2, sm: 4 },
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #fef3c7 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-300 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-300 to-transparent rounded-full blur-3xl" />
      </div>

      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 relative z-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <Typography 
              variant="h5" 
              className="font-bold text-emerald-700"
              sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Coffee Farming Knowledge Base
            </Typography>
          </div>

          <Typography 
            variant="h1" 
            className="text-3xl md:text-5xl font-black mb-4"
            sx={{ color: 'grey.900' }}
          >
            Expert Answers for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Coffee Farmers
            </span>
          </Typography>

          <Typography 
            variant="h6" 
            className="text-lg md:text-xl text-grey-600 max-w-3xl mx-auto mb-8"
            sx={{ fontWeight: 400 }}
          >
            Practical solutions and expert advice for successful coffee cultivation in East Africa
          </Typography>

          {/* Search Bar */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for coffee farming questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-5 h-5 text-grey-400" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-grey-100 rounded-full"
                    >
                      ✕
                    </button>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: 'white',
                  borderColor: 'rgb(209, 213, 219)',
                  '&:hover': {
                    borderColor: 'rgb(16, 185, 129)',
                  },
                  '&.Mui-focused': {
                    borderColor: 'rgb(16, 185, 129)',
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
                  },
                },
              }}
            />
          </motion.div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 relative z-10"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-grey-700 border border-grey-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    openItems.includes(faq.id)
                      ? 'border-emerald-300 shadow-2xl'
                      : 'border-grey-100 hover:border-emerald-200 hover:shadow-lg'
                  }`}>
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-6 text-left bg-gradient-to-r from-white to-grey-50 hover:from-emerald-50 hover:to-emerald-50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            openItems.includes(faq.id)
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {faq.icon}
                          </div>
                          <div>
                            <Typography variant="h5" className="font-bold text-grey-900 mb-1">
                              {faq.question}
                            </Typography>
                            <div className="flex items-center gap-3">
                              <Chip
                                label={faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                                size="small"
                                className="bg-emerald-100 text-emerald-800"
                              />
                              {faq.priority === 'high' && (
                                <Chip
                                  label="Important"
                                  size="small"
                                  className="bg-amber-100 text-amber-800"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: openItems.includes(faq.id) ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-grey-400" />
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
                          <CardContent className="p-6 bg-white">
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
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-grey-100 to-grey-200 flex items-center justify-center">
                  <Search className="w-10 h-10 text-grey-400" />
                </div>
                <Typography variant="h5" className="font-semibold text-grey-700 mb-2">
                  No questions found
                </Typography>
                <Typography variant="body1" className="text-grey-500">
                  Try a different search term or browse all categories
                </Typography>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 relative z-10"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h3" className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Need Immediate Farming Advice?
                  </Typography>
                  <Typography variant="body1" className="text-emerald-100 mb-6">
                    Connect with our agricultural experts for personalized guidance on your coffee farm.
                  </Typography>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-lg">
                      Contact Expert
                    </button>
                    <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300">
                      Download Farming Guide
                    </button>
                  </div>
                </Grid>
                <Grid item xs={12} md={4}>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl" />
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <Typography variant="h6" className="font-semibold text-white">
                          Expert Support
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-emerald-100">
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