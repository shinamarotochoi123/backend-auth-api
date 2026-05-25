import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db: any = {};
export default db;

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = parseInt(process.env.DB_PORT || '3306');

// Build connection string
const DATABASE_URL = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('📡 Connecting to database...');
console.log(`🔗 Host: ${DB_HOST}:${DB_PORT}`);
console.log(`📁 Database: ${DB_NAME}`);

async function initialize() {
  try {
    // Create database if not exists (for cloud MySQL)
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    console.log('✅ Database ready');
  } catch (err) {
    console.log('⚠️ Database creation skipped (may already exist)');
  }

  // Connect using Sequelize
  const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  // Test connection
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Import models
  const accountModel = (await import('../accounts/account.model')).default;
  const refreshTokenModel = (await import('../accounts/refresh-token.model')).default;

  // Initialize models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  // Define relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  // Sync models with database
  await sequelize.sync({ alter: true });
  console.log('✅ Database initialized and models synced');
}

initialize();