import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Camera, Image } from 'lucide-react';
import logo from '../../assets/coffee.webp';
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Close mobile menu when pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && e.target.closest('nav')) {
        // Allow clicks inside nav
        return;
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const scrollToCameraSection = () => {
    const cameraSection = document.querySelector('[data-camera-section]');
    if (cameraSection) {
      cameraSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const triggerCameraCapture = () => {
    // Scroll to camera section first
    scrollToCameraSection();
    // Wait a bit for scroll, then click the camera button
    setTimeout(() => {
      const cameraButton = document.querySelector('[data-camera-button]');
      if (cameraButton) {
        cameraButton.click();
      }
    }, 500);
    setIsMobileMenuOpen(false);
  };

  const triggerGalleryUpload = () => {
    // Scroll to camera section first
    scrollToCameraSection();
    // Wait a bit for scroll, then click the gallery button
    setTimeout(() => {
      const galleryButton = document.querySelector('[data-gallery-button]');
      if (galleryButton) {
        galleryButton.click();
      }
    }, 500);
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ height: 'var(--navbar-height)' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-lg"
    >
      <div className="w-full h-full px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
          {/* Logo Section */}
          <motion.div
            className="flex items-center gap-1 sm:gap-3 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
              <motion.img
                src={logo}
                alt="Coffee Logo"
                className="w-full h-full rounded-full object-cover shadow-lg border-2 border-amber-300"
                whileHover={{ rotate: 20 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur opacity-30"></div>
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent truncate">
                HEALTHY COFFEE
              </h1>
              <p className="text-xs text-amber-600 truncate">Plant Health Intelligence</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center flex-1 gap-6 xl:gap-8 justify-center">
            <ul className="flex items-center gap-4 xl:gap-8 text-sm text-amber-700">
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a 
                  href="#home" 
                  className="nav-link hover:text-amber-800 transition-colors duration-300 whitespace-nowrap" 
                  onClick={handleNavClick}
                >
                  Home
                </a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a 
                  href="#gallery" 
                  className="nav-link hover:text-amber-800 transition-colors duration-300 whitespace-nowrap" 
                  onClick={handleNavClick}
                >
                  Gallery
                </a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a 
                  href="#features" 
                  className="nav-link hover:text-amber-800 transition-colors duration-300 whitespace-nowrap" 
                  onClick={handleNavClick}
                >
                  Features
                </a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a 
                  href="#stats" 
                  className="nav-link hover:text-amber-800 transition-colors duration-300 whitespace-nowrap" 
                  onClick={handleNavClick}
                >
                  Stats
                </a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a 
                  href="#askme" 
                  className="nav-link hover:text-amber-800 transition-colors duration-300 whitespace-nowrap" 
                  onClick={handleNavClick}
                >
                  Ask
                </a>
              </motion.li>
            </ul>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400" />
              <input
                type="search"
                placeholder="Search..."
                aria-label="Search"
                className="pl-10 pr-3 py-2 border border-amber-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-sm"
              />
            </div>

            <motion.button
              onClick={triggerCameraCapture}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2 px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-sm whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open camera to analyze"
            >
              Analyze
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors duration-300 relative flex-shrink-0"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
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
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-amber-200 shadow-2xl overflow-hidden"
            >
              <div className="px-3 sm:px-4 md:px-6 py-4 max-w-7xl mx-auto">
                {/* Search in Mobile Menu */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400" />
                    <input
                      type="search"
                      placeholder="Search..."
                      aria-label="Search"
                      className="w-full pl-10 pr-3 py-2 border border-amber-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-sm"
                    />
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="pb-4 border-b border-amber-100">
                  <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Menu className="h-4 w-4" />
                    Navigation
                  </h3>
                  <ul className="space-y-2">
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a 
                        href="#home" 
                        className="block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg px-4 py-3 transition-all duration-300 text-sm touch-target" 
                        onClick={handleNavClick}
                      >
                        Home
                      </a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a 
                        href="#gallery" 
                        className="block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg px-4 py-3 transition-all duration-300 text-sm touch-target" 
                        onClick={handleNavClick}
                      >
                        Gallery
                      </a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a 
                        href="#features" 
                        className="block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg px-4 py-3 transition-all duration-300 text-sm touch-target" 
                        onClick={handleNavClick}
                      >
                        Features
                      </a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a 
                        href="#stats" 
                        className="block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg px-4 py-3 transition-all duration-300 text-sm touch-target" 
                        onClick={handleNavClick}
                      >
                        Stats
                      </a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a 
                        href="#askme" 
                        className="block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg px-4 py-3 transition-all duration-300 text-sm touch-target" 
                        onClick={handleNavClick}
                      >
                        Ask
                      </a>
                    </motion.li>
                  </ul>
                </div>

                {/* Analyze Button & Camera Shortcuts */}
                <div className="pt-4 mobile-center">
                  <motion.button
                    onClick={triggerCameraCapture}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-sm mb-4 touch-target mobile-center-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Open camera to analyze"
                  >
                    Analyze Photo
                  </motion.button>

                  <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2 mobile-center">
                    <Camera className="h-4 w-4" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2 mobile-center">
                    <motion.button
                      onClick={triggerCameraCapture}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-all duration-300 touch-target mobile-center"
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 mobile-center">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 mobile-center">
                        <div className="font-medium text-sm mobile-center-text">Open Camera</div>
                        <div className="text-xs text-amber-600 mobile-center-text">Take photo directly</div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={triggerGalleryUpload}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-all duration-300 touch-target mobile-center"
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 mobile-center">
                        <Image className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 mobile-center">
                        <div className="font-medium text-sm mobile-center-text">From Gallery</div>
                        <div className="text-xs text-amber-600 mobile-center-text">Select existing photo</div>
                      </div>
                    </motion.button>
                  </div>
                </div>
                {/* Analyze Button & Camera Shortcuts */}
                <div className="pt-4">
                  <motion.button
                    onClick={triggerCameraCapture}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-sm mb-4 touch-target"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Open camera to analyze"
                  >
                    Analyze Photo
                  </motion.button>

                  <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <motion.button
                      onClick={triggerCameraCapture}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-all duration-300 touch-target"
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Open Camera</div>
                        <div className="text-xs text-amber-600">Take photo directly</div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={triggerGalleryUpload}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-all duration-300 touch-target"
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                        <Image className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">From Gallery</div>
                        <div className="text-xs text-amber-600">Select existing photo</div>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
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
