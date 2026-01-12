/**
 * Resizes an image file or blob to 224x224 pixels
 * @param file - The image file or blob to resize
 * @returns Promise resolving to a resized blob
 */
export function resizeImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Set canvas size to 224x224
      canvas.width = 224;
      canvas.height = 224;

      // Calculate aspect ratio and crop to center
      const imgAspect = img.width / img.height;
      const canvasAspect = 224 / 224;
      let sx, sy, sWidth, sHeight;

      if (imgAspect > canvasAspect) {
        // Image is wider, crop sides
        sHeight = img.height;
        sWidth = img.height * canvasAspect;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        // Image is taller, crop top/bottom
        sWidth = img.width;
        sHeight = img.width / canvasAspect;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      // Draw and resize the image
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 224, 224);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create resized image blob'));
        }
      }, file.type, 0.95); // Maintain quality
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the image
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}
