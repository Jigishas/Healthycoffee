import React from 'react'
import './App.css'
import Navbar from './Components/Navbar/NAvbar'
import Body from './Components/BODY/Below_Nav/Body'
import ImageSlider from './Components/BODY/imageSlider/ImageSlider'
//import Askme from './Components/ABOUT/Ask me/Askme'
import Footer from './Components/footer/footer'
import Whatsapp from './Components/BODY/Ask me/Whatsapp'
import Stat from './Components/BODY/Stat/Stat'
import Belowimg from './Components/BODY/imageSlider/Belowimg'
import AboutCoffee from './Components/ABOUT/AboutCoffee'

function App() {
  
  return (
    <>
      <Navbar />
      <Body />
      <ImageSlider />
      <Belowimg />
       <Stat />
       <AboutCoffee />
       <Whatsapp />
      <Footer />
     
    </>
  )
}

export default App;
