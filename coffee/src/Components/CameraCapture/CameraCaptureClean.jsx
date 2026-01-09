import React, { useState, useRef, useEffect } from 'react';

const BACKEND_URL = import.meta.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';

const CameraCapture = React.forwardRef((props, ref) => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [stream, preview]);

  const startCamera = async () => {
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const constraints = { video: { facingMode: 'environment' } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('startCamera', err);
      setError('Cannot access camera. Check permissions or use gallery upload.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    try { if (videoRef.current) videoRef.current.pause(); } catch (e) {}
    setCameraActive(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = URL.createObjectURL(file);
      setPreview(url);
      await upload(file);
    }, 'image/jpeg', 0.9);
  };

  const openFilePicker = () => fileInputRef.current && fileInputRef.current.click();

  const onFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Select an image file'); return; }
    const url = URL.createObjectURL(f);
    setPreview(url);
    await upload(f);
  };

  const upload = async (file) => {
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${BACKEND_URL}/api/upload-image`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      try { const data = await res.json(); console.log('upload result', data); } catch (_) {}
    } catch (err) {
      console.error('upload', err);
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold">Camera Capture</h3>
        <p className="text-sm text-gray-600">Start camera, capture a photo, or upload from gallery.</p>
      </div>

      <div className="mb-4">
        <div className="w-full h-56 bg-black/5 rounded overflow-hidden flex items-center justify-center">
          {cameraActive ? (
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm text-gray-500">Camera preview</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button className="px-3 py-2 bg-emerald-500 text-white rounded" onClick={startCamera}>Start Camera</button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={capture} disabled={!cameraActive}>Capture</button>
        <button className="px-3 py-2 bg-gray-500 text-white rounded" onClick={stopCamera} disabled={!cameraActive}>Stop</button>
        <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={openFilePicker}>Upload</button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />

      {loading && <div className="text-sm text-gray-600 mb-2">Uploading...</div>}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      {preview && (
        <div className="mt-4">
          <div className="font-semibold mb-2">Preview</div>
          <img src={preview} alt="preview" className="w-full rounded object-contain" />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
});

CameraCapture.displayName = 'CameraCapture';
export default CameraCapture;
