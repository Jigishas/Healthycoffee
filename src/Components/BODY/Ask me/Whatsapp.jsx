import React, { useState } from 'react';
import { useRef } from 'react';
import './Whatsapp.css';

const Whatsapp = () => {
  const [message, setMessage] = useState('');
    const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setRecording(true);
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = e => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioURL(URL.createObjectURL(audioBlob));
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Message:', message);
  };

  // WhatsApp logic inside the main component
  const handleWhatsAppClick = () => {
    const phoneNumber = '254743121169';
    const defaultMessage = "Hello! I'm interested in a healthy Coffee.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="whatsapp-container" id="askme">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your question here..."
          rows="4"
          cols="50"
        /><br />
        <button type="submit" className='submit-button'>Submit</button>
         <button id="whatsapp" onClick={handleWhatsAppClick} className='whatsapp-button2'>
        Chat on WhatsApp
      </button>
      </form>

      <div className="whatsapp-section">
  
      {/* Audio Recording Section */}
      <div className="audio-recorder">
        {!recording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
        {audioURL && (
          <div>
            <audio src={audioURL} controls />
            <a href={audioURL} download="recording.wav">Download</a>
          </div>
        )}
      </div>
    </div>
      
      {/* Inline WhatsApp button */}
      <button id="whatsapp" onClick={handleWhatsAppClick} className='whatsapp-button'>
        Chat on WhatsApp
      </button>
    </div>
  );
};

export default Whatsapp;