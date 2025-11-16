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

function App() {
  return (
    <>
      <Navbar />
      <Body />
      <ImageSlider />
      <Belowimg />
      <Stat />
      <Askme />
      <CameraCapture />
      
           
      <Whatsapp />
      <Footer />
    </>
  )
}

export default App;
