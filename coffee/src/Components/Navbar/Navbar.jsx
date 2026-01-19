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
      style={{ height: 'var(--navbar-height)' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <motion.div
            className="flex items-center space-x-3 h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
                <motion.img
                  src={logo}
                  alt="Coffee Logo"
                  className="h-15 w-15 rounded-full object-cover shadow-lg border-2 border-amber-300"
                  whileHover={{ rotate: 20 }}
                  transition={{ duration: 0.6 }}
                />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur opacity-30"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                HEALTHY COFFEE
              </h1>
              <p className="text-xs text-amber-600">Plant Health Intelligence</p>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8 text-sm text-amber-700">
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a href="#home" className="nav-link hover:text-amber-800 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a href="#gallery" className="nav-link hover:text-amber-800 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Gallery</a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a href="#features" className="nav-link hover:text-amber-800 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a href="#stats" className="nav-link hover:text-amber-800 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Stats</a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <a href="#askme" className="nav-link hover:text-amber-800 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Ask</a>
              </motion.li>
            </ul>

            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  aria-label="Search"
                  className="pl-10 pr-3 py-2 border border-amber-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                />
              </div>

              <motion.button
                onClick={triggerCameraCapture}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open camera to analyze"
              >
                Analyze
              </motion.button>
            </div>
          </nav>

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
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="md:hidden mt-6 bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-2xl overflow-hidden max-w-sm mx-auto"
            >
              <div className="py-4">
                {/* Navigation Links */}
                <div className="px-6 py-4 border-b border-amber-100">
                  <h3 className="text-sm font-semibold text-amber-800 mb-4 flex items-center gap-2">
                    <Menu className="h-4 w-4" />
                    Navigation
                  </h3>
                  <ul className="space-y-3">
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a href="#home" className="w-full block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl px-4 py-3 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a href="#gallery" className="w-full block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl px-4 py-3 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Gallery</a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a href="#features" className="w-full block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl px-4 py-3 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a href="#stats" className="w-full block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl px-4 py-3 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Stats</a>
                    </motion.li>
                    <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <a href="#askme" className="w-full block text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl px-4 py-3 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>Ask</a>
                    </motion.li>
                  </ul>
                </div>

                {/* Camera Shortcuts */}
                <div className="px-6 py-4">
                  <h3 className="text-sm font-semibold text-amber-800 mb-4 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Camera Shortcuts
                  </h3>
                  <div className="space-y-3">
                    <motion.button
                      onClick={triggerCameraCapture}
                      className="w-full flex items-center gap-4 px-4 py-3 text-left text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl transition-all duration-300"
                      whileHover={{ scale: 1.03, x: 5 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">Open Camera</div>
                        <div className="text-xs text-amber-600">Take photo directly</div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={triggerGalleryUpload}
                      className="w-full flex items-center gap-4 px-4 py-3 text-left text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl transition-all duration-300"
                      whileHover={{ scale: 1.03, x: 5 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Image className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">From Gallery</div>
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
