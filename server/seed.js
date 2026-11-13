import { initDb } from './store.js';

process.env.RESET_DB = '1';
const db = await initDb();
console.log(`Seeded ${db.profiles.length} profiles and ${db.users.length} accounts.`);
