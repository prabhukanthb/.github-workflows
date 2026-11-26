import app from '../server/index.js';

export default function handler(req, res) {
  const url = req.url || '/';
  if (!url.startsWith('/api') && Array.isArray(req.query?.path)) {
    const query = url.includes('?') ? url.slice(url.indexOf('?')) : '';
    req.url = `/api/${req.query.path.join('/')}${query}`;
  }
  return app(req, res);
}
