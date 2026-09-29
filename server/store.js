import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { buildSeed } from './seedData.js';
import { assertTeluguMongoUri, TELUGU_DB } from './deployGuard.js';

const FILE = path.join(process.cwd(), 'data', 'db.json');
const SITE_ID = 'telugu-kalyanamala';

let db = null;
let queue = Promise.resolve();
let mongoCollection = globalThis.__teluguKalyanamalaMongo || null;

function usesMongo() {
  return Boolean(process.env.MONGODB_URI);
}

async function collection() {
  if (mongoCollection) return mongoCollection;
  const uri = process.env.MONGODB_URI;
  assertTeluguMongoUri(uri);
  const client = new MongoClient(uri);
  await client.connect();
  mongoCollection = client.db(TELUGU_DB).collection('site');
  globalThis.__teluguKalyanamalaMongo = mongoCollection;
  return mongoCollection;
}

async function persist() {
  if (usesMongo()) {
    const col = await collection();
    await col.updateOne(
      { _id: SITE_ID },
      { $set: { site: SITE_ID, state: db } },
      { upsert: true }
    );
    return;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export function getDb() {
  if (!db) throw new Error('Database is not ready');
  return db;
}

export function update(mutator) {
  const run = queue.then(async () => {
    const next = mutator(db);
    db = next;
    await persist();
    return db;
  });
  queue = run.then(() => undefined, () => undefined);
  return run;
}

async function seed() {
  const officeHash = await bcrypt.hash('Office@12345', 8);
  const memberHash = await bcrypt.hash('Member@12345', 8);
  db = buildSeed({ officeHash, memberHash });
  await persist();
  return db;
}

export async function initDb() {
  if (db && process.env.RESET_DB !== '1') return db;
  if (usesMongo()) {
    const col = await collection();
    if (process.env.RESET_DB !== '1') {
      const existing = await col.findOne({ _id: SITE_ID });
      if (existing?.state?.users && existing.site === SITE_ID) {
        db = existing.state;
        return db;
      }
    }
    return seed();
  }
  const reset = process.env.RESET_DB === '1';
  if (!reset && fs.existsSync(FILE)) {
    db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return db;
  }
  return seed();
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
