import React, { useState, useEffect } from 'react';
import image8 from '../../../assets/image8.jpg';
import image6 from '../../../assets/image6.jpg';
import image4 from '../../../assets/image4.jpg';
import image5 from '../../../assets/image5.jpg';
import image3 from '../../../assets/image3.jpg';

const images = [image8, image6, image4, image5, image3];

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mx-auto mt-10 mb-4 overflow-hidden rounded-2xl shadow-2xl bg-white relative h-80">
      <img
        src={images[current]}
        alt={`Coffee plantation ${current + 1}`}
        className="w-full h-full object-cover rounded-2xl transition-opacity duration-700"
      />
    </div>
  );
};

export default ImageSlider;
