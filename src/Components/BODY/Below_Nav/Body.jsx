import React from 'react'
import image1 from '../../../Assets/image2.jpg'
import './Below-nav.css'
import author from '../../../Assets/author.jpg'

function Body() {
  return (
    <div>
      <img src={image1} alt="" className='image1'/>
      <div className='text1'>
        <h1>Did you know?</h1>
        <h3>Coffee is one of the leading exports in kenya.It is grown in many parts of the country and farmers profit from it a lot. </h3>
      </div>

      <div className='text2'>
        <h1>Coffee plant</h1>
<div className='quote'>
<h3>"You cannot roast in quality that was never grown in the plant. A healthy coffee plant is the first and most important ingredient in the cup."</h3>
<img src={author} alt="" className='author' />
<h5>James Hernandez</h5>
</div>
      </div>
      
    </div>
  )
}

export default Body;
