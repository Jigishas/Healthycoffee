import React from 'react'
import './App.css'
import Navbar from './Components/Navbar/Navbar'
import Body from './Components/BODY/Below_Nav/Body'
import ImageSlider from './Components/BODY/imageSlider/ImageSlider'
//import Askme from './Components/ABOUT/Ask me/Askme'
import Footer from './Components/footer/Footer'
import Whatsapp from './Components/BODY/Ask me/Whatsapp'
import Stat from './Components/BODY/Stat/Stat'
import Belowimg from './Components/BODY/imageSlider/Belowimg'
//import AboutCoffee from './Components/ABOUT/AboutCoffee'
import Askme from './Components/BODY/Ask me/Askme'
import Upload from './Components/BODY/Ask me/upload'

function App() {
  
  return (
    <>
      <Navbar />
      <Body />
      <ImageSlider />
      <Belowimg />
      <Stat />
       <Askme />
       <Upload />
       <Whatsapp />
      <Footer />
     
    </>
  )
}

export default App;
