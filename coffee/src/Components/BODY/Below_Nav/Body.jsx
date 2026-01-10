import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronDown, Quote } from 'lucide-react';
import { Box, Typography, Stack, Avatar } from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '@mui/material';
import image2 from '../../../assets/image2.jpg';
import author from '../../../assets/author.jpg';

function Body() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section with Background Image */}
      <motion.div
        className="relative w-full min-h-screen flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="w-full h-screen relative">
          <motion.img
            src={image2}
            alt="Coffee plantation landscape"
            className="w-full h-screen object-cover object-center"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Subtle Gradient Overlay (reduced vertical coverage) */}
          <div className="absolute left-0 right-0 top-6 bottom-6 md:top-12 md:bottom-12 mx-auto rounded-2xl bg-gradient-to-br from-black/30 via-emerald-900/12 to-amber-900/18 pointer-events-none" />
        </div>

        {/* Main Content - Hero Section */}
        <div className="absolute inset-0 flex items-center justify-center px-6 lg:px-16 py-12">
          <motion.div
            className="max-w-2xl w-full transform -translate-x-4 md:-translate-x-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-sm p-6 md:p-10 rounded-2xl border border-white/20 shadow-xl"
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(255, 255, 255, 0.15)"
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative text-center">
                {/* Glowing Effect */}
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-2xl blur-lg opacity-20"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <motion.h1
                  className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 relative z-10 leading-tight"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <span className="bg-gradient-to-r from-amber-200 via-white to-emerald-200 bg-clip-text text-transparent">
                    Did you know?
                  </span>
                </motion.h1>

                <motion.div
                  className="relative z-10"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <h3 className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-medium drop-shadow-2xl max-w-3xl mx-auto pl-1 blur-left-card">
  Coffee is one of the leading exports in Kenya. It is grown in many parts of the country and farmers profit from it a lot.
</h3>

                  {/* Animated Underline */}
                  <motion.div
                    className="mt-6 md:mt-8 w-24 md:w-32 h-1 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full mx-auto"
                    animate={{ scaleX: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-white text-center">
            <motion.div
              className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className="w-1 h-3 bg-white rounded-full mt-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
            <ChevronDown className="w-4 h-4 text-white mx-auto mt-2" />
          </div>
        </motion.div>
      </motion.div>

      {/* Quote Section */}
       <Box sx={{ bgcolor: 'white', py: { xs: 18, md: 26 }, px: 8 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Card className="bg-slate-50 p-8 md:p-16 rounded-3xl border border-slate-200/50 shadow-xl">
            <CardContent>
              {/* Quote Icon */}
              <motion.div
                className="text-6xl md:text-8xl text-amber-500 mb-6 md:mb-8 opacity-80 text-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Quote />
              </motion.div>

              <Typography
                variant="h2"
                align="center"
                sx={{ mb: 8, color: 'slate.800', fontWeight: 'black', fontSize: { xs: '1xl', md: '2xl', lg: '3xl' } }}
              >
                Coffee Plant Wisdom
              </Typography>

              <Stack spacing={8}>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontStyle: 'italic', color: 'slate.700', textAlign: 'center', fontWeight: 'light', fontSize: { xs: 'lg', md: 'xl', lg: '2xl' } }}
                  >
                    "You cannot roast in quality that was never grown in the plant. A healthy coffee plant is the first and most important ingredient in the cup."
                  </Typography>
                </Box>

                {/* Author Section */}
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'slate.200',
                    '&:hover': { borderColor: 'slate.300', transform: 'scale(1.02)' },
                    transition: 'all 0.3s',
                    maxWidth: '4xl',
                    mx: 'auto',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    src={author}
                    alt="James Hernandez"
                    sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'slate.400' }}
                  />
                  <Stack alignItems="flex-start" spacing={1}>
                    <Typography variant="h6" sx={{ color: 'slate.800' }}>
                      James Hernandez
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'slate.600' }}>
                      Coffee Expert & Agriculturist
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </div>
  );
}

export default Body;
