import React, { useState, useRef } from 'react';
import './Upload.css';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview('');
    }
    setStatus('');
    setDescription('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus('Please select an image to upload.');
      return;
    }
    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('description', description);

    try {
      // Replace with your backend endpoint
      const response = await fetch('https://your-backend-server.com/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setStatus('Image uploaded successfully!');
        setSelectedFile(null);
        setPreview('');
        setDescription('');
      } else {
        setStatus('Upload failed. Please try again.');
      }
    } catch (error) {
      setStatus('Error uploading image.');
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  return (
    <div className='upload-container'>
      <h2>Upload Your Coffee Image</h2>
      <input
        type="file"
        accept="image/*"
        className="upload-input"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button className="choose-file-btn" onClick={openFilePicker}>
        Choose Image
      </button>
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
      {selectedFile && (
        <>
          <textarea
            className="upload-description"
            placeholder="Add a description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
          <button className="send-button" onClick={handleUpload}>
            Send
          </button>
        </>
      )}
      {status && <div className="upload-status">{status}</div>}
    </div>
  );
};

export default Upload;