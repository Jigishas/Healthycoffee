
import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Camera, Image, ChevronDown } from 'lucide-react';
import logo from '../../assets/coffee.webp';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToCameraSection = () => {
    const cameraSection = document.querySelector('[data-camera-section]');
    if (cameraSection) {
      cameraSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const triggerCameraCapture = () => {
    // Try to find and click the camera button in CameraCapture component
    const cameraButton = document.querySelector('button[onclick*="openCamera"]') ||
                        document.querySelector('button:has(.text-2xl):has(.📷)');
    if (cameraButton) {
      cameraButton.click();
    } else {
      // Fallback: scroll to camera section
      scrollToCameraSection();
    }
    setIsMobileMenuOpen(false);
  };

  const triggerGalleryUpload = () => {
    // Try to find and click the gallery button in CameraCapture component
    const galleryButton = document.querySelector('button[onclick*="openGallery"]') ||
                         document.querySelector('button:has(.text-2xl):has(.🖼️)');
    if (galleryButton) {
      galleryButton.click();
    } else {
      // Fallback: scroll to camera section
      scrollToCameraSection();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <motion.img
                src={logo}
                alt="Coffee Logo"
                className="h-12 w-12 rounded-full object-cover shadow-lg border-2 border-amber-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur opacity-30"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                CoffeeAI
              </h1>
              <p className="text-xs text-amber-600">Plant Health Intelligence</p>
            </div>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Home', id: 'home' },
              { name: 'Gallery', id: 'gallery' },
              { name: 'Features', id: 'features' },
              { name: 'Stats', id: 'stats' },
              { name: 'Ask Me', id: 'askme' },
              { name: 'Camera', id: 'camera' }
            ].map((item) => (
              <motion.a
                key={item.name}
                href={`#${item.id}`}
                className="text-amber-700 hover:text-amber-900 font-medium transition-colors duration-300 relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </motion.a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors duration-300 relative"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-amber-700" />
            ) : (
              <Menu className="h-6 w-6 text-amber-700" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 bg-white/95 backdrop-blur-sm rounded-xl border border-amber-200 shadow-xl overflow-hidden"
            >
              <div className="py-2">
                {/* Camera Shortcuts */}
                <div className="px-4 py-3 border-b border-amber-100">
                  <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Quick Capture
                  </h3>
                  <div className="space-y-2">
                    <motion.button
                      onClick={triggerCameraCapture}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📷</span>
                      </div>
                      <div>
                        <div className="font-medium">Open Camera</div>
                        <div className="text-xs text-amber-600">Take photo directly</div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={triggerGalleryUpload}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🖼️</span>
                      </div>
                      <div>
                        <div className="font-medium">From Gallery</div>
                        <div className="text-xs text-amber-600">Select existing photo</div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="px-4 py-3">
                  <h3 className="text-sm font-semibold text-amber-800 mb-3">Navigation</h3>
                  {[
                    { name: 'Home', id: 'home' },
                    { name: 'Gallery', id: 'gallery' },
                    { name: 'Features', id: 'features' },
                    { name: 'Stats', id: 'stats' },
                    { name: 'Ask Me', id: 'askme' },
                    { name: 'Camera', id: 'camera' }
                  ].map((item) => (
                    <motion.a
                      key={item.name}
                      href={`#${item.id}`}
                      className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-2 right-20 w-2 h-2 bg-amber-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-2 left-32 w-1.5 h-1.5 bg-orange-400 rounded-full"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </motion.nav>
  );
}

export default Navbar;
