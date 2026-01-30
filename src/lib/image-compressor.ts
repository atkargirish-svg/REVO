
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1080,
  useWebWorker: true,
  initialQuality: 0.8,
};

export async function compressImage(imageFile: File): Promise<File> {
  try {
    console.log(`Original image size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
    const compressedFile = await imageCompression(imageFile, options);
    console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // If compression fails, return the original file
    return imageFile;
  }
}
