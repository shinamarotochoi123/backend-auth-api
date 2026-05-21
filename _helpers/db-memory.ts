// In-memory database for demo - complete implementation
let accounts: any[] = [];
let refreshTokens: any[] = [];

// Account model with scope support
const AccountModel = {
  findAll: () => [...accounts],
  findOne: (options: any) => {
    const where = options?.where;
    if (where?.email) {
      return accounts.find(a => a.email === where.email);
    }
    return null;
  },
  findByPk: (id: number) => accounts.find(a => a.id === id),
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
  count: () => accounts.length,
  // Add scope method for password hash
  scope: (scopeName: string) => {
    return {
      findOne: (options: any) => {
        const account = AccountModel.findOne(options);
        if (account && scopeName === 'withHash') {
          // Add a fake password hash
          return { ...account, passwordHash: account.password };
        }
        return account;
      }
    };
  }
};

// RefreshToken model
const RefreshTokenModel = {
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
  },
  findAll: () => [...refreshTokens]
};

export const db = {
  accounts,
  refreshTokens,
  Account: AccountModel,
  RefreshToken: RefreshTokenModel,
  sequelize: {
    sync: () => Promise.resolve(),
    authenticate: () => Promise.resolve()
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
      passwordHash: '123456',
      role: 'Admin',
      isVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      getRefreshTokens: () => []
    });
    console.log('✅ Demo admin account created: admin@test.com / 123456');
  }
  console.log('✅ In-memory database ready (complete implementation)');
};

export default db;