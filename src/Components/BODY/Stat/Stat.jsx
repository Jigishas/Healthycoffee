import React from 'react'
import './Stat.css'

const Stat = () => {
  return (
    <div className='stats'>
      <div className='stat'>
        <h2>✨</h2>
        <h2>5K+</h2>
        <p>Diseases solved</p>
      </div>
        <div className='stat'>
        <h2>🥇</h2>
        <h2>10K+</h2>
        <p>Farmers helped</p>
        </div>
        <div className='stat'>
        <h2>🌱</h2>
        <h2>15K+</h2>
        <p>Coffee planted</p>
        </div>
        <div className='stat'>
        <h2>☕</h2>
        <h2>20K+</h2>  
        <p>Cups of coffee</p>
        </div> 
    </div>
  )
}

export default Stat;
