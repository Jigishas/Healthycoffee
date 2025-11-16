
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import logo from '../../assets/coffee.webp';

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 backdrop-blur-md border-b border-amber-200/50 shadow-xl"
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

          {/* Search Bar */}
          <motion.div
            className="flex-1 max-w-md mx-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative group">
              <input
                type="text"
                placeholder="Search coffee insights..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-full text-gray-700 placeholder-amber-400 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500 group-hover:text-amber-600 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            className="hidden md:flex items-center space-x-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {['Home', 'About', 'Services', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="text-amber-700 hover:text-amber-900 font-medium transition-colors duration-300 relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </motion.a>
            ))}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors duration-300"
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-6 w-6 text-amber-700" />
          </motion.button>
        </div>
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
