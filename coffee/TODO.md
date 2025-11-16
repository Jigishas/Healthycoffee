# TODO: Fix Camera Preview Issue

## Current Issue
- Camera opens but shows "Video element not available" error
- No preview is displayed when camera is accessed
- Video element is conditionally rendered only when `cameraActive` is true, but `cameraActive` is set after attempting to set the stream

## Plan
1. **Modify Camera Loading State**: Add the video element to the loading state so it's rendered while the camera is opening, allowing the preview to show during loading.
2. **Update openCamera Function**: Remove conditional checks for `videoRef.current` since the video element will be available in the loading state. Set `srcObject` directly.
3. **Ensure Preview During Loading**: The video will display the camera feed immediately when the stream is set, overlaid with the loading spinner.
4. **Switch to Active State**: Once the video loads and plays, switch to the active camera view with capture buttons.

## Steps to Implement
- [ ] Edit CameraCapture.jsx to add video element in loading state
- [ ] Update openCamera logic to set srcObject without checks
- [ ] Test the camera preview functionality
