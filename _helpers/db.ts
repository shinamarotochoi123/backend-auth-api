import { db as memoryDb, initDb as initMemoryDb } from './db-memory';

// Use in-memory database for demo
const db = memoryDb;
const initDb = initMemoryDb;

console.log('⚠️ Using in-memory database (no MySQL required)');

export { db, initDb };
export default db;