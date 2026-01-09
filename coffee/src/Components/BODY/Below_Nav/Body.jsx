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
        className="relative w-full min-h-[70vh] flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="w-full h-full relative">
          <motion.img
            src={image2}
            alt="Coffee plantation landscape"
            className="w-fit max-h-fit object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-emerald-900/18 to-amber-900/22" />
        </div>

        {/* Main Content - Hero Section */}
        <div className="absolute inset-0 flex items-center justify-center px-8 lg:px-20 py-16">
          <motion.div
            className="max-w-4xl w-full"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl"
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(255, 255, 255, 0.15)"
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative text-center">
                {/* Glowing Effect */}
                <motion.div
                  className="absolute -inset-6 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-3xl blur-xl opacity-20"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8 relative z-10 leading-tight"
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
       <Box sx={{ bgcolor: 'white', py: { xs: 16, md: 24 }, px: 8 }}>
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
                variant="h1"
                align="center"
                sx={{ mb: 8, color: 'slate.800', fontWeight: 'black', fontSize: { xs: '2xl', md: '3xl', lg: '4xl' } }}
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
                  spacing={6}
                  sx={{
                    p: 6,
                    bgcolor: 'white',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'slate.200',
                    '&:hover': { borderColor: 'slate.300', transform: 'scale(1.02)' },
                    transition: 'all 0.3s',
                    maxWidth: '2xl',
                    mx: 'auto',
                    alignItems: 'center'
                  }}
                >
                  <Avatar
                    src={author}
                    alt="James Hernandez"
                    sx={{ width: 80, height: 80, border: '3px solid', borderColor: 'slate.400' }}
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
