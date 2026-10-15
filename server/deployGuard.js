export const TELUGU_DB = 'telugu-kalyanamala';
export const TELUGU_PHOTO_FOLDER = 'telugu-kalyanamala';
export const TELUGU_DOMAINS = ['telugukalyanamala.com', 'telugukalyanamala.org'];

const OTHER_SITE = /new[-_]?kalyanamala/i;

export function normalizeMongoUri(uri) {
  let value = String(uri || '').trim();
  if (value.toLowerCase().startsWith('mongodb_uri=')) value = value.slice('mongodb_uri='.length).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

export function assertTeluguMongoUri(uri) {
  const value = normalizeMongoUri(uri);
  if (!value) throw new Error('MONGODB_URI is missing.');
  if (!/^mongodb(\+srv)?:\/\//i.test(value)) {
    throw new Error('MONGODB_URI must start with mongodb+srv:// and must not include quotes or the name MONGODB_URI.');
  }
  if (OTHER_SITE.test(value)) {
    throw new Error('Refusing a New Kalyanamala MongoDB URI. Use a database named telugu-kalyanamala.');
  }
  const path = value.split('?')[0].replace(/\/+$/, '');
  if (!path.endsWith(`/${TELUGU_DB}`)) {
    throw new Error('MONGODB_URI must use the database telugu-kalyanamala. Example: mongodb+srv://USER:PASSWORD@cluster.mongodb.net/telugu-kalyanamala');
  }
  return value;
}

export function assertTeluguCloudinary({ cloudName = '', url = '' } = {}) {
  if (OTHER_SITE.test(`${cloudName} ${url}`)) {
    throw new Error('Refusing New Kalyanamala Cloudinary settings. Use a separate Cloudinary cloud for Telugu Kalyanamala.');
  }
}
