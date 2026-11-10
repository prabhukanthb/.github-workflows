import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.VERCEL = '1';

function request(port, host, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method: 'GET', headers: { host } }, (res) => {
      res.resume();
      resolve(res);
    });
    req.on('error', reject);
    req.end();
  });
}

test('newkalyanamala domains redirect to Telugu Kalyanamala', async () => {
  const { default: app } = await import('./index.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const hosts = ['newkalyanamala.com', 'www.newkalyanamala.com', 'newkalyanamala.org', 'www.newkalyanamala.org', 'telugukalyanamala.org'];
    for (const host of hosts) {
      const response = await request(port, host, '/browse?from=old');
      assert.equal(response.statusCode, 301, host);
      assert.equal(response.headers.location, 'https://www.telugukalyanamala.com/browse?from=old');
    }
    const current = await request(port, 'www.telugukalyanamala.com', '/browse');
    assert.notEqual(current.statusCode, 301);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
