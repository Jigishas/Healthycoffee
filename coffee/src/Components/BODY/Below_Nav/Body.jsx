import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronDown, Quote, Sprout, Coffee, TrendingUp, Users, Shield } from 'lucide-react';
import { Box, Typography, Stack, Avatar, Grid, Container } from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '@mui/material';
import image2 from '../../../assets/image2.jpg';
import author from '../../../assets/author.jpg';

function Body() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-amber-50">
      {/* Hero Section */}
      <motion.div
        className="relative w-full min-h-screen flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Background with gradient overlay */}
        <div className="absolute inset-0">
          <motion.img
            src={image2}
            alt="Coffee plantation landscape"
            className="w-full h-full object-cover object-center"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
          {/* Enhanced gradient for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/85 via-emerald-800/70 to-amber-900/60" />
        </div>

        {/* Main Content */}
        <Container maxWidth="xl" className="relative z-10 px-4">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} lg={7}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                {/* Main Content Card */}
                <Card className="bg-white/95 backdrop-blur-sm p-6 md:p-10 rounded-3xl border border-white/30 shadow-2xl">
                  <CardContent>
                    {/* Badge */}
                    <motion.div
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-full mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Sprout className="w-5 h-5" />
                      <span className="font-semibold">Farmer's Insight</span>
                    </motion.div>

                    <Typography
                      variant="h1"
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
                      sx={{ color: 'grey.900' }}
                    >
                      Coffee Farming in{' '}
                      <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                        Kenya & East Africa
                      </span>
                    </Typography>

                    <Typography
                      variant="body1"
                      className="text-lg md:text-xl text-grey-700 mb-8 leading-relaxed"
                    >
                      Empowering over 700,000 farming families across East Africa with cutting-edge plant health intelligence and sustainable farming practices.
                    </Typography>

                    {/* Quick Stats */}
                    <Grid container spacing={3} className="mb-8">
                      <Grid item xs={6} md={3}>
                        <motion.div 
                          className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-lg"
                          whileHover={{ y: -5 }}
                        >
                          <TrendingUp className="w-8 h-8 text-emerald-600 mb-2" />
                          <Typography variant="h5" className="font-bold text-grey-900">
                            #1 Export
                          </Typography>
                          <Typography variant="body2" className="text-grey-600">
                            Leading export product
                          </Typography>
                        </motion.div>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <motion.div 
                          className="bg-white p-4 rounded-2xl border border-amber-100 shadow-lg"
                          whileHover={{ y: -5 }}
                        >
                          <Coffee className="w-8 h-8 text-amber-600 mb-2" />
                          <Typography variant="h5" className="font-bold text-grey-900">
                            Easy to Grow
                          </Typography>
                          <Typography variant="body2" className="text-grey-600">
                            Low maintenance crop
                          </Typography>
                        </motion.div>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <motion.div 
                          className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-lg"
                          whileHover={{ y: -5 }}
                        >
                          <Users className="w-8 h-8 text-emerald-600 mb-2" />
                          <Typography variant="h5" className="font-bold text-grey-900">
                            700K+ Farmers
                          </Typography>
                          <Typography variant="body2" className="text-grey-600">
                            Across the region
                          </Typography>
                        </motion.div>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <motion.div 
                          className="bg-white p-4 rounded-2xl border border-amber-100 shadow-lg"
                          whileHover={{ y: -5 }}
                        >
                          <Shield className="w-8 h-8 text-amber-600 mb-2" />
                          <Typography variant="h5" className="font-bold text-grey-900">
                            Stable Income
                          </Typography>
                          <Typography variant="body2" className="text-grey-600">
                            Reliable returns
                          </Typography>
                        </motion.div>
                      </Grid>
                    </Grid>

                    {/* CTA Buttons */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <Button
                        variant="contained"
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                        size="large"
                      >
                        Learn Farming Tips
                      </Button>
                      <Button
                        variant="outlined"
                        className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 py-3 rounded-xl font-semibold"
                        size="large"
                      >
                        Market Prices
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Right side - Farmer Tips */}
            <Grid item xs={12} lg={5}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
                  <CardContent>
                    <Typography variant="h4" className="font-bold mb-6 flex items-center gap-3">
                      <Sprout className="w-7 h-7" />
                      Quick Tips for Farmers
                    </Typography>
                    
                    <Stack spacing={4}>
                      {[
                        "Plant in well-drained soil with partial shade",
                        "Maintain pH between 6.0-6.5 for optimal growth",
                        "Prune regularly for better yield",
                        "Harvest only red, ripe cherries",
                        "Proper drying prevents mold growth"
                      ].map((tip, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm"
                          whileHover={{ x: 5 }}
                        >
                          <div className="bg-white/20 p-1.5 rounded-lg">
                            <span className="font-bold text-amber-100">{index + 1}</span>
                          </div>
                          <Typography className="text-amber-50 font-medium">
                            {tip}
                          </Typography>
                        </motion.div>
                      ))}
                    </Stack>
                    
                    <Button
                      variant="contained"
                      className="mt-6 bg-white text-amber-700 hover:bg-amber-50 w-full py-3 rounded-xl font-semibold shadow-lg"
                    >
                      View All Farming Guide
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            className="text-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="mb-2">
              <Typography variant="body2" className="text-white font-semibold">
                Scroll for Expert Advice
              </Typography>
            </div>
            <motion.div
              className="w-10 h-16 border-2 border-white rounded-full flex justify-center backdrop-blur-sm bg-white/10 mx-auto"
              whileHover={{ borderColor: 'rgba(255,255,255,1)', backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <motion.div
                className="w-1.5 h-4 bg-white rounded-full mt-3"
                animate={{ opacity: [1, 0.3, 1], y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Expert Quote Section */}
      <Box sx={{ py: { xs: 12, md: 16 }, px: { xs: 3, sm: 6 } }} id="gallery">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-emerald-200/20 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-emerald-200/20 to-amber-200/20 rounded-full translate-y-24 -translate-x-24" />
              
              <CardContent className="relative z-10 p-8 md:p-12">
                <Stack spacing={8} alignItems="center">
                  {/* Quote Header */}
                  <div className="text-center">
                    <motion.div
                      className="inline-block p-4 bg-gradient-to-r from-amber-100 to-emerald-100 rounded-2xl mb-6"
                      whileHover={{ rotate: 5 }}
                    >
                      <Quote className="w-12 h-12 text-amber-600" />
                    </motion.div>
                    
                    <Typography
                      variant="h2"
                      className="text-3xl md:text-4xl lg:text-5xl font-black mb-4"
                      sx={{ color: 'grey.900' }}
                    >
                      Words from an{' '}
                      <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                        Agriculture Expert
                      </span>
                    </Typography>
                    
                    <Typography variant="h6" className="text-grey-600 font-medium">
                      Essential wisdom for successful coffee farming
                    </Typography>
                  </div>

                  {/* Main Quote */}
                  <Box className="relative max-w-4xl mx-auto">
                    <div className="absolute -top-4 -left-4 text-7xl md:text-8xl text-amber-200 opacity-60">
                      "
                    </div>
                    <Typography
                      variant="h4"
                      className="text-xl md:text-2xl lg:text-3xl text-grey-800 font-light leading-relaxed text-center px-4 md:px-8 italic"
                    >
                      "Quality begins in the field, not in the roaster. A healthy coffee plant 
                      with proper care yields the best beans. Remember, you cannot roast in 
                      quality that was never grown in the plant."
                    </Typography>
                    <div className="absolute -bottom-4 -right-4 text-7xl md:text-8xl text-emerald-200 opacity-60">
                      "
                    </div>
                  </Box>

                  {/* Author Card */}
                  <motion.div
                    className="w-full max-w-md"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border border-grey-200 rounded-2xl shadow-lg">
                      <CardContent className="p-6">
                        <Stack direction="row" spacing={3} alignItems="center">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Avatar
                              src={author}
                              alt="James Hernandez"
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                border: '3px solid white',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </motion.div>
                          
                          <Stack spacing={1}>
                            <Typography variant="h5" className="font-bold text-grey-900">
                              James Hernandez
                            </Typography>
                            <Typography variant="body2" className="text-grey-600">
                              Senior Agriculture Specialist
                            </Typography>
                            <div className="flex gap-2">
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                                Coffee Expert
                              </span>
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                20+ Years Experience
                              </span>
                            </div>
                          </Stack>
                        </Stack>
                        
                        <Typography variant="body2" className="mt-4 text-grey-700">
                          Working with East African coffee farmers for over two decades, 
                          helping improve yields and quality through sustainable practices.
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-10 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
                    size="large"
                    startIcon={<Coffee />}
                  >
                    Contact for Consultation
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </div>
  );
}

export default Body;