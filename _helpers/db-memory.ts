// In-memory database for demo - no MySQL required
let accounts: any[] = [];
let refreshTokens: any[] = [];

// Helper functions
function hashPassword(password: string) {
  // Simple hash for demo (in production use bcrypt)
  return password;
}

export const db = {
  accounts,
  refreshTokens,
  Account: {
    findAll: () => {
      return accounts;
    },
    findOne: (options: any) => {
      const where = options?.where;
      if (where?.email) {
        return accounts.find(a => a.email === where.email);
      }
      return null;
    },
    findByPk: (id: number) => {
      return accounts.find(a => a.id === id);
    },
    create: (data: any) => {
      const newAccount = { 
        ...data, 
        id: accounts.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      accounts.push(newAccount);
      return newAccount;
    },
    update: (id: number, data: any) => {
      const index = accounts.findIndex(a => a.id === id);
      if (index !== -1) {
        accounts[index] = { ...accounts[index], ...data, updatedAt: new Date() };
        return accounts[index];
      }
      return null;
    },
    destroy: (options: any) => {
      const id = options?.where?.id;
      accounts = accounts.filter(a => a.id !== id);
      return 1;
    },
    count: () => accounts.length
  },
  RefreshToken: {
    create: (data: any) => {
      const newToken = { 
        ...data, 
        id: refreshTokens.length + 1,
        isActive: true,
        createdAt: new Date()
      };
      refreshTokens.push(newToken);
      return newToken;
    },
    findOne: (options: any) => {
      const token = options?.where?.token;
      return refreshTokens.find(t => t.token === token);
    },
    destroy: (options: any) => {
      const token = options?.where?.token;
      refreshTokens = refreshTokens.filter(t => t.token !== token);
      return 1;
    }
  }
};

export const initDb = async () => {
  // Add a default admin account for testing
  if (accounts.length === 0) {
    accounts.push({
      id: 1,
      title: 'Mr',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: '123456',
      role: 'Admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Demo admin account created: admin@test.com / 123456');
  }
  console.log('✅ In-memory database ready (demo mode)');
};

export default db;