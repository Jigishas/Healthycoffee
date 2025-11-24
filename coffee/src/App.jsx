import React from 'react'
import './app.css'
import Navbar from './Components/Navbar/Navbar'
import Body from './Components/BODY/Below_Nav/Body'
import ImageSlider from './Components/BODY/imageSlider/ImageSlider'
import Footer from './Components/footer/Footer'
import Whatsapp from './Components/BODY/Ask me/Whatsapp'
import Stat from './Components/BODY/Stat/Stat'
import Belowimg from './Components/BODY/imageSlider/Belowimg'
import Askme from './Components/BODY/Ask me/Askme'
import CameraCapture from './Components/CameraCapture/CameraCapture'
import Upload from './Components/Uploads/Upload'
import PWAInstallPrompt from './Components/PWAInstallPrompt'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
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
        <div id="stats">
          <Stat />
        </div>
        <div id="askme">
          <Askme />
        </div>
        <div id="camera">
          <CameraCapture />
        </div>
      </main>
      <Whatsapp />
      <Footer />
      <PWAInstallPrompt />
    </div>
  )
}

export default App;
