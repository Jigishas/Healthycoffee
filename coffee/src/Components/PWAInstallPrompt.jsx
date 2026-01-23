import React, { useState } from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'
import { Button } from './ui/button'
import { Download, Smartphone, X } from 'lucide-react'
import { motion } from 'framer-motion'

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (isInstalled || !isInstallable || dismissed) {
    return null
  }

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-sm z-50"
    >
      <div className="bg-white/98 backdrop-blur-md border border-green-200 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Install Healthy Coffee</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Get the full experience with offline access and camera features
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={installPWA}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-sm min-h-[40px] touch-target"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Install Now</span>
                <span className="sm:hidden">Install</span>
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PWAInstallPrompt
