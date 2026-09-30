export const SUB_CASTES = [
  { label: 'SC', value: 'SC' },
  { label: 'BC', value: 'BC' },
  { label: 'OC', value: 'OC' },
  { label: 'Not applicable', value: 'NA' }
];

export const HEIGHT_OPTIONS = (() => {
  const options = [];
  for (let feet = 4; feet <= 6; feet += 1) {
    const maxInches = feet === 6 ? 12 : 11;
    for (let inches = 0; inches <= maxInches; inches += 1) {
      const label = `${feet}.${inches}`;
      let storedFeet = feet;
      let storedInches = inches;
      if (inches === 12) {
        storedFeet = feet + 1;
        storedInches = 0;
      }
      options.push({ label, value: label, feet: storedFeet, inches: storedInches });
    }
  }
  return options;
})();

export function heightToValue(feet, inches) {
  if (feet === '' || feet == null) return '';
  const f = Number(feet);
  const i = Number(inches || 0);
  if (Number.isNaN(f)) return '';
  if (f === 7 && i === 0) return '6.12';
  return `${f}.${i}`;
}

export function incomeToLacsInput(income) {
  const n = Number(income);
  if (!Number.isFinite(n) || n <= 0) return '';
  const lacs = n < 10000 ? n : n / 100000;
  const rounded = Math.round(lacs * 10) / 10;
  if (rounded <= 0) return '';
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export async function lookupIndianPincode(pin) {
  if (!/^[0-9]{6}$/.test(pin)) return null;
  const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
  const data = await response.json();
  const offices = data?.[0]?.PostOffice;
  if (!Array.isArray(offices) || !offices.length) return null;
  const office = offices.find((item) => item?.DeliveryStatus === 'Delivery') || offices[0];
  return {
    city: String(office?.Block || office?.Name || office?.District || '').trim(),
    district: String(office?.District || '').trim(),
    state: String(office?.State || '').trim(),
    country: String(office?.Country || 'India').trim() || 'India'
  };
}
