import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronDown, Quote } from 'lucide-react';
import { Box, Text, VStack, HStack, Avatar, Heading, useColorModeValue } from '@chakra-ui/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
            className="w-full h-full object-cover"
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
      <motion.div
        className="relative bg-white py-16 md:py-24 px-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="bg-slate-50 p-8 md:p-16 rounded-3xl border border-slate-200/50 shadow-xl"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quote Icon */}
            <motion.div
              className="text-6xl md:text-8xl text-amber-500 mb-6 md:mb-8 opacity-80 text-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Quote />
            </motion.div>

              <motion.h1
                className="text-3xl md:text-4xl font-black text-slate-800 mb-8 md:mb-12 relative text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <span className="text-slate-900">
                  Coffee Plant Wisdom
                </span>
                {/* Animated Underline */}
                <motion.div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 md:w-40 h-1 bg-slate-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </motion.h1>

            <div className="space-y-8 md:space-y-12">
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {/* Glowing Border Effect */}
                <motion.div
                  className="absolute -inset-6 md:-inset-8 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-3xl blur-lg opacity-50"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <blockquote className="relative bg-white p-6 md:p-12 rounded-2xl border border-slate-200 shadow-lg">
                  <h3 className="text-lg md:text-xl lg:text-2xl italic text-slate-700 leading-relaxed font-light text-center">
                    "You cannot roast in quality that was never grown in the plant. A healthy coffee plant is the first and most important ingredient in the cup."
                  </h3>
                </blockquote>
              </motion.div>

              {/* Author Section */}
              <motion.div
                className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 group shadow-lg max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  {/* Animated Ring */}
                  <motion.div
                    className="absolute -inset-3 border-3 border-slate-400 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.img
                    src={author}
                    alt="James Hernandez"
                    className="w-24 md:w-32 h-24 md:h-32 rounded-full border-3 border-slate-400 shadow-xl"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-center">
                  <h5 className="text-xl md:text-2xl font-bold text-slate-800 group-hover:text-slate-600 transition-colors duration-300">
                    James Hernandez
                  </h5>
                  <p className="text-slate-600 text-base md:text-lg font-light">Coffee Expert & Agriculturist</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Body;
