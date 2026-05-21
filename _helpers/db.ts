// _helpers/db.ts - Switch between real MySQL and in-memory
import { db as memoryDb, initDb as initMemoryDb } from './db-memory';

// Use in-memory database (bypass MySQL issues for demo)
let db = memoryDb;
let initDb = initMemoryDb;

console.log('⚠️ Using in-memory database (no MySQL required)');

export { db, initDb };
export default db;