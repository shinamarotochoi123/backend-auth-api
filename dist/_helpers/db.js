"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// _helpers/db.ts
const promise_1 = __importDefault(require("mysql2/promise"));
const sequelize_1 = require("sequelize");
const account_model_1 = __importDefault(require("../accounts/account.model"));
const refresh_token_model_1 = __importDefault(require("../accounts/refresh-token.model"));
const db = {};
exports.default = db;
initialize();
async function initialize() {
    // Use DATABASE_URL from environment variables
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL environment variable is not set!');
        console.error('Please add DATABASE_URL to your Render environment variables.');
        process.exit(1);
    }
    console.log('📡 Connecting to database...');
    // Parse the DATABASE_URL to get individual parts (optional, for creating DB if needed)
    // For MySQL URLs like: mysql://user:password@host:port/database?ssl-mode=REQUIRED
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = parseInt(url.port || '3306');
    const user = url.username;
    const password = url.password;
    const database = url.pathname.substring(1); // Remove leading slash
    // Create DB if it doesn't exist (only if we have individual connection parts)
    try {
        const connection = await promise_1.default.createConnection({
            host,
            port,
            user,
            password
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();
        console.log(`✅ Database '${database}' ready`);
    }
    catch (err) {
        console.log('⚠️ Could not create database, may already exist or using cloud DB');
    }
    // Connect to DB using Sequelize with DATABASE_URL
    const sequelize = new sequelize_1.Sequelize(databaseUrl, {
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
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
    // Init models
    db.Account = (0, account_model_1.default)(sequelize);
    db.RefreshToken = (0, refresh_token_model_1.default)(sequelize);
    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database initialized and models synced');
}
