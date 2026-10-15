import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudinaryStatus, uploadTeluguPhoto } from './photos.js';

test('health can name a missing Cloudinary variable', () => {
  const previous = process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_CLOUD_NAME;
  assert.ok(cloudinaryStatus().missing.includes('CLOUDINARY_CLOUD_NAME'));
  if (previous) process.env.CLOUDINARY_CLOUD_NAME = previous;
});

test('photo upload stays off until Cloudinary is configured', async () => {
  const previous = {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET
  };
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
  await assert.rejects(() => uploadTeluguPhoto('data:image/jpeg;base64,aaaa'), /Cloudinary is not configured/);
  if (previous.name) process.env.CLOUDINARY_CLOUD_NAME = previous.name;
  if (previous.key) process.env.CLOUDINARY_API_KEY = previous.key;
  if (previous.secret) process.env.CLOUDINARY_API_SECRET = previous.secret;
});
