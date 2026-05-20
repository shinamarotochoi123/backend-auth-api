import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

console.log('📡 Connecting to database...');

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
sequelize.authenticate()
  .then(() => console.log('✅ Database connection established'))
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Init models
db.Account = accountModel(sequelize);
db.RefreshToken = refreshTokenModel(sequelize);

// Relationships
db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
db.RefreshToken.belongsTo(db.Account);

// Sync models
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database initialized and models synced'))
  .catch(err => console.error('⚠️ Sync error:', err.message));