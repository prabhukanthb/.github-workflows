import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { buildSeed } from './seedData.js';

const FILE = path.join(process.cwd(), 'data', 'db.json');

let db = null;
let queue = Promise.resolve();

export function getDb() {
  if (!db) throw new Error('Database is not ready');
  return db;
}

function persist() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export function update(mutator) {
  const run = queue.then(() => {
    const next = mutator(db);
    db = next;
    persist();
    return db;
  });
  queue = run.then(() => undefined, () => undefined);
  return run;
}

export async function initDb() {
  const reset = process.env.RESET_DB === '1';
  if (!reset && fs.existsSync(FILE)) {
    db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return db;
  }
  const officeHash = await bcrypt.hash('Office@12345', 8);
  const memberHash = await bcrypt.hash('Member@12345', 8);
  db = buildSeed({ officeHash, memberHash });
  persist();
  return db;
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    surname: user.surname,
    role: user.role,
    status: user.status
  };
}

export function presentProfile(profile, users, { contact = false } = {}) {
  const owner = users.find((user) => user.id === profile.userId);
  return {
    ...profile,
    firstName: owner?.firstName || '',
    lastName: owner?.lastName || '',
    surname: owner?.surname || '',
    email: contact ? owner?.email : undefined,
    phone: contact ? owner?.phone : undefined
  };
}
