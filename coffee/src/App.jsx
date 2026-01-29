import React, { useEffect } from 'react'
import './app.css'
import Navbar from './Components/Navbar/Navbar'
import Body from './Components/BODY/Below_Nav/Body'
import ImageSlider from './Components/BODY/imageSlider/ImageSlider'
import Footer from './Components/footer/Footer'
import Whatsapp from './Components/BODY/Ask me/Whatsapp'
//import Stat from './Components/BODY/Stat/Stat'
import Belowimg from './Components/BODY/imageSlider/Belowimg'
import CameraCapture from './Components/CameraCapture/CameraCapture'
import PWAInstallPrompt from './Components/PWAInstallPrompt'
import { getBackendUrl } from './config'
import './pingBackend.js'

function App() {
  const backendUrl = getBackendUrl();

  // Immediately check backend status on app render in production
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      fetch(`${backendUrl}/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ping_type: 'app_load_check',
          timestamp: new Date().toISOString(),
          source: 'frontend_app',
          version: '1.0.0'
        })
      })
      .then(response => {
        if (response.ok) {
          console.log('[App Load] Backend is online and responding');
        } else {
          console.log('[App Load] Backend check failed with status:', response.status);
        }
      })
      .catch(error => {
        console.log('[App Load] Backend check error:', error.message);
      });
    }
  }, []);

  return (
    <div className="app-container min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Navbar />
      <main className="relative">
        <div id="home">
          <Body />
        </div>
        <div id="gallery">
          <ImageSlider />
        </div>
        <div id="features">
          <Belowimg />
        </div>
        {/* <div id="stats">
          <Stat />
        </div> */}
       
        <div id="camera" data-camera-section>
          <CameraCapture uploadUrl={backendUrl} />
        </div>
      </main>
      <Whatsapp />
      <Footer />
      <PWAInstallPrompt />
    </div>
  )
}

export default App;
