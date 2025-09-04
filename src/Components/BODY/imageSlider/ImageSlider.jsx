import React, { useState, useEffect } from 'react';
import './ImageSlider.css';
import image8 from '../../../Assets/image8.jpg';
import image6 from '../../../Assets/image6.jpg';
import image4 from '../../../Assets/image4.jpg';
import image5 from '../../../Assets/image5.jpg';
import image3 from '../../../Assets/image3.jpg';

const images = [image8, image6, image4, image5, image3];

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3500); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <div className="image-slider">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Coffee ${idx + 1}`}
          className={`slider-image${current === idx ? ' active' : ''}`}
        />
      ))}

       
    </div>
    <div className='healthy-coffee'>
        <h2>Healthy Coffee</h2>
        <p>A healthy coffee plant is the foundation of the entire coffee industry. It ensures high yields of quality beans, supports farmer livelihoods, and is more resistant to pests and diseases, which is vital for sustainable production.</p>
        </div>

  </>      
  );
};

export default ImageSlider;
