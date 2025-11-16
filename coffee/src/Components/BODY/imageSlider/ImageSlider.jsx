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
    <div className="w-full mx-auto mt-10 mb-4 overflow-hidden rounded-2xl shadow-2xl bg-white flex justify-center items-center relative h-96 pt-24 animate-fade-in">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Coffee plantation ${idx + 1}`}
          className={`absolute left-10 top-0 w-full h-24 object-cover rounded-2xl opacity-0 transition-all duration-1000 ${
            current === idx ? 'opacity-100 scale-105' : 'scale-100'
          } hover:scale-110 cursor-pointer`}
        />
      ))}

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === idx ? 'bg-coffee-orange scale-125' : 'bg-gray-300 hover:bg-coffee-brown'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
