export const TELUGU_DB = 'telugu-kalyanamala';
export const TELUGU_PHOTO_FOLDER = 'telugu-kalyanamala';
export const TELUGU_DOMAINS = ['telugukalyanamala.com', 'telugukalyanamala.org'];

const OTHER_SITE = /new[-_]?kalyanamala/i;

export function assertTeluguMongoUri(uri) {
  const value = String(uri || '').trim();
  if (!value) throw new Error('MONGODB_URI is missing.');
  if (OTHER_SITE.test(value)) {
    throw new Error('Refusing a New Kalyanamala MongoDB URI. Use a database named telugu-kalyanamala.');
  }
  const path = value.split('?')[0].replace(/\/+$/, '');
  if (!path.endsWith(`/${TELUGU_DB}`)) {
    throw new Error('MONGODB_URI must use the database telugu-kalyanamala. Example: mongodb+srv://USER:PASSWORD@cluster.mongodb.net/telugu-kalyanamala');
  }
}

export function assertTeluguCloudinary({ cloudName = '', url = '' } = {}) {
  if (OTHER_SITE.test(`${cloudName} ${url}`)) {
    throw new Error('Refusing New Kalyanamala Cloudinary settings. Use a separate Cloudinary cloud for Telugu Kalyanamala.');
  }
}
