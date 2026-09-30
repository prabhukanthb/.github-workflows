export const PASSWORD_HINT =
  'first 4 letters of the full name, then @, then the last 4 digits of the registered mobile';

export function defaultPassword(name, phone) {
  const namePart = String(name || '').replace(/[^a-zA-Z]/g, '').slice(0, 4) || 'User';
  const last4 = String(phone || '').replace(/\D/g, '').slice(-4);
  if (last4.length !== 4) {
    throw new Error('A 10-digit mobile number is required for the default password.');
  }
  return `${namePart}@${last4}`;
}

const LACS_THRESHOLD = 10000;

export function toIncomeRupees(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < LACS_THRESHOLD) return Math.round(n * 100000);
  return Math.round(n);
}

export function incomeToLacsInput(income) {
  const n = Number(income);
  if (!Number.isFinite(n) || n <= 0) return '';
  const lacs = n < LACS_THRESHOLD ? n : n / 100000;
  const rounded = Math.round(lacs * 10) / 10;
  if (rounded <= 0) return '';
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}
