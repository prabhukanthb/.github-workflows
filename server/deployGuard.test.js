import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTeluguCloudinary, assertTeluguMongoUri } from './deployGuard.js';

test('accepts only the telugu-kalyanamala database', () => {
  assert.equal(
    assertTeluguMongoUri('  "mongodb+srv://user:pass@cluster.mongodb.net/telugu-kalyanamala?retryWrites=true"  '),
    'mongodb+srv://user:pass@cluster.mongodb.net/telugu-kalyanamala?retryWrites=true'
  );
});

test('refuses a connection string that does not start with mongodb', () => {
  assert.throws(
    () => assertTeluguMongoUri('MONGODB_URI=cluster0.pjkheex.mongodb.net/telugu-kalyanamala'),
    /mongodb\+srv:\/\//
  );
});

test('refuses a missing database name', () => {
  assert.throws(
    () => assertTeluguMongoUri('mongodb+srv://user:pass@cluster.mongodb.net'),
    /telugu-kalyanamala/
  );
});

test('refuses the New Kalyanamala database', () => {
  assert.throws(
    () => assertTeluguMongoUri('mongodb+srv://user:pass@cluster.mongodb.net/newkalyanamala'),
    /New Kalyanamala/
  );
  assert.throws(
    () => assertTeluguMongoUri('mongodb+srv://user:pass@cluster.mongodb.net/new-kalyanamala'),
    /New Kalyanamala/
  );
});

test('refuses New Kalyanamala Cloudinary settings', () => {
  assert.throws(
    () => assertTeluguCloudinary({ cloudName: 'newkalyanamala' }),
    /New Kalyanamala/
  );
  assert.doesNotThrow(() => assertTeluguCloudinary({ cloudName: 'dabc123' }));
});
