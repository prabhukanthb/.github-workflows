function clean(value) {
  return String(value || '').trim();
}

export function addressText(address, { maskStreetAndArea = false } = {}) {
  if (!address) return '';
  const street = clean(address.streetName);
  const area = clean(address.area);
  const place = [
    clean(address.pinCode),
    maskStreetAndArea ? (street ? '••••' : '') : street,
    maskStreetAndArea ? (area ? '••••' : '') : area,
    clean(address.city),
    clean(address.district)
  ].filter(Boolean);
  const line = [...place, clean(address.state), clean(address.country)].filter(Boolean);
  return line.join(', ');
}
