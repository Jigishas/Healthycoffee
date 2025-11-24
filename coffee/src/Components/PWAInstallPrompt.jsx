import React from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'
import { Button } from './ui/button'
import { Download, Smartphone } from 'lucide-react'

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()

  if (isInstalled || !isInstallable) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/95 backdrop-blur-sm border border-green-200 rounded-xl p-4 shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Smartphone className="w-8 h-8 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Install Healthy Coffee</h3>
          <p className="text-xs text-gray-600 mt-1">
            Get the full experience with offline access and camera features
          </p>
        </div>
        <Button
          onClick={installPWA}
          size="sm"
          className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-1" />
          Install
        </Button>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
