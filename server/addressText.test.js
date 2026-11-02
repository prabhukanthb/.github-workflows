import test from 'node:test';
import assert from 'node:assert/strict';
import { addressText } from '../client/src/addressText.js';

test('downloaded profiles mask street name and area', () => {
  const address = {
    pinCode: '520004',
    streetName: 'Manohara Apartments',
    area: 'Machavaram',
    city: 'Vijayawada',
    district: 'NTR',
    state: 'Andhra Pradesh',
    country: 'India'
  };
  assert.equal(
    addressText(address, { maskStreetAndArea: true }),
    '520004, ••••, ••••, Vijayawada, NTR, Andhra Pradesh, India'
  );
  assert.equal(
    addressText(address),
    '520004, Manohara Apartments, Machavaram, Vijayawada, NTR, Andhra Pradesh, India'
  );
});

test('an address without street or area stays unchanged when masked', () => {
  const address = { pinCode: '520004', city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India' };
  assert.equal(addressText(address, { maskStreetAndArea: true }), addressText(address));
});
