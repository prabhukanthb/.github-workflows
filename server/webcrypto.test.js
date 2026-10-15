import test from 'node:test';
import assert from 'node:assert/strict';
import './webcrypto.js';

test('web crypto is available for MongoDB login', () => {
  assert.equal(typeof globalThis.crypto.subtle.digest, 'function');
});
