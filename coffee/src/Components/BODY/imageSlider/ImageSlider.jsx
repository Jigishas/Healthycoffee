import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import image8 from '../../../assets/image8.jpg';
import image6 from '../../../assets/image6.jpg';
import image4 from '../../../assets/image4.jpg';
import image5 from '../../../assets/image5.jpg';
import image3 from '../../../assets/image3.jpg';

const images = [
  { src: image8, alt: 'Coffee plantation landscape' },
  { src: image6, alt: 'Coffee berries close-up' },
  { src: image4, alt: 'Coffee plants in morning light' },
  { src: image5, alt: 'Coffee farming operations' },
  { src: image3, alt: 'Sustainable coffee cultivation' }
];

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const goToPrev = () => {
    setCurrent(prev => (prev - 1 + images.length) % images.length);
    setAutoPlay(false);
  };

  const goToNext = () => {
    setCurrent(prev => (prev + 1) % images.length);
    setAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrent(index);
    setAutoPlay(false);
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 my-8 sm:my-10 md:my-12 mobile-center">
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto mobile-center">
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current].src}
              alt={images[current].alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Image Counter */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
            {current + 1} / {images.length}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4 pointer-events-none">
          <motion.button
            onClick={goToPrev}
            onMouseEnter={() => setAutoPlay(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300 touch-target"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
          </motion.button>

          <motion.button
            onClick={goToNext}
            onMouseEnter={() => setAutoPlay(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300 touch-target"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
          </motion.button>
        </div>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 sm:gap-3 px-4">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`touch-target rounded-full transition-all duration-300 ${
                index === current
                  ? 'bg-amber-500 w-3 h-3 sm:w-3.5 sm:h-3.5'
                  : 'bg-white/60 hover:bg-white/80 w-2 h-2 sm:w-2.5 sm:h-2.5'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play Indicator */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          {autoPlay && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full shadow-lg"
              title="Auto-play active"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
