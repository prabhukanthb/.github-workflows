import { v2 as cloudinary } from 'cloudinary';
import { assertTeluguCloudinary, TELUGU_PHOTO_FOLDER } from './deployGuard.js';

export function photosConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadTeluguPhoto(dataUrl) {
  assertTeluguCloudinary({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    url: process.env.CLOUDINARY_URL || ''
  });
  if (!photosConfigured()) {
    const error = new Error('Cloudinary is not configured for Telugu Kalyanamala.');
    error.status = 503;
    throw error;
  }
  const match = String(dataUrl || '').match(/^data:image\/(jpeg|jpg|png|webp);base64,([a-z0-9+/=\s]+)$/i);
  if (!match) {
    const error = new Error('Choose a JPG, PNG, or WebP photo.');
    error.status = 400;
    throw error;
  }
  const bytes = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (!bytes.length || bytes.length > 3_500_000) {
    const error = new Error('Photo must be under 3.5 MB.');
    error.status = 400;
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  const uploaded = await cloudinary.uploader.upload(dataUrl, {
    folder: TELUGU_PHOTO_FOLDER,
    resource_type: 'image',
    tags: [TELUGU_PHOTO_FOLDER]
  });
  if (!uploaded.secure_url || !uploaded.secure_url.includes(`/${TELUGU_PHOTO_FOLDER}/`)) {
    throw new Error('Cloudinary did not store the photo in the Telugu Kalyanamala folder.');
  }
  return uploaded.secure_url;
}
