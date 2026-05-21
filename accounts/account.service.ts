// accounts/account.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import sendEmail from '../_helpers/send-email';
import db from '../_helpers/db';
import Role from '../_helpers/role';

const secret = process.env.JWT_SECRET || 'your_secret_key';

export default {
  authenticate,
  refreshToken,
  revokeToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

async function authenticate({ email, password, ipAddress }: any) {
  const account = await db.Account.findOne({ where: { email } });

  if (!account || !account.isVerified || account.password !== password) {
    throw 'Email or password is incorrect';
  }

  const jwtToken = generateJwtToken(account);
  const refreshToken = generateRefreshToken(account, ipAddress);
  await db.RefreshToken.create(refreshToken);

  return { ...basicDetails(account), jwtToken, refreshToken: refreshToken.token };
}

async function refreshToken({ token, ipAddress }: any) {
  const refreshToken = await getRefreshToken(token);
  const account = await db.Account.findByPk(refreshToken.accountId);

  if (!account) throw 'Invalid token';

  // Revoke old token
  await db.RefreshToken.destroy({ where: { token } });

  // Create new tokens
  const newRefreshToken = generateRefreshToken(account, ipAddress);
  await db.RefreshToken.create(newRefreshToken);
  const jwtToken = generateJwtToken(account);

  return { ...basicDetails(account), jwtToken, refreshToken: newRefreshToken.token };
}

async function revokeToken({ token, ipAddress }: any) {
  const refreshToken = await getRefreshToken(token);
  if (!refreshToken) throw 'Token not found';
  await db.RefreshToken.destroy({ where: { token } });
}

async function register(params: any, origin: any) {
  const existingAccount = await db.Account.findOne({ where: { email: params.email } });
  
  if (existingAccount) {
    return await sendAlreadyRegisteredEmail(params.email, origin);
  }

  const isFirstAccount = (await db.Account.count()) === 0;
  const account = {
    ...params,
    role: isFirstAccount ? Role.Admin : Role.User,
    verificationToken: randomTokenString(),
    passwordHash: params.password,
    isVerified: false
  };

  await db.Account.create(account);
  await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }: any) {
  const account = await db.Account.findOne({ where: { verificationToken: token } });
  if (!account) throw 'Verification failed';
  
  await db.Account.update(account.id, {
    isVerified: true,
    verificationToken: null
  });
}

async function forgotPassword({ email }: any, origin: any) {
  const account = await db.Account.findOne({ where: { email } });
  if (!account) return;
  
  const resetToken = randomTokenString();
  await db.Account.update(account.id, {
    resetToken: resetToken,
    resetTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  
  await sendPasswordResetEmail({ ...account, resetToken }, origin);
}

async function validateResetToken({ token }: any) {
  const account = await db.Account.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { [Op.gt]: new Date() }
    }
  });
  if (!account) throw 'Invalid token';
  return account;
}

async function resetPassword({ token, password }: any) {
  const account = await validateResetToken({ token });
  await db.Account.update(account.id, {
    password: password,
    passwordHash: password,
    resetToken: null,
    resetTokenExpires: null,
    isVerified: true
  });
}

async function getAll() {
  const accounts = await db.Account.findAll();
  return accounts.map((x: any) => basicDetails(x));
}

async function getById(id: any) {
  const account = await getAccount(id);
  return basicDetails(account);
}

async function create(params: any) {
  const existingAccount = await db.Account.findOne({ where: { email: params.email } });
  if (existingAccount) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const account = {
    ...params,
    isVerified: true,
    passwordHash: params.password
  };
  await db.Account.create(account);
  return basicDetails(account);
}

async function update(id: any, params: any) {
  const account = await getAccount(id);

  if (params.email && account.email !== params.email) {
    const existingAccount = await db.Account.findOne({ where: { email: params.email } });
    if (existingAccount) {
      throw 'Email "' + params.email + '" is already taken';
    }
  }

  const updateData: any = { ...params };
  if (params.password) {
    updateData.passwordHash = params.password;
  }
  delete updateData.confirmPassword;

  await db.Account.update(id, updateData);
  return basicDetails({ ...account, ...updateData });
}

async function _delete(id: any) {
  const account = await getAccount(id);
  await db.Account.destroy({ where: { id: account.id } });
}

// Helper functions
async function getAccount(id: any) {
  const account = await db.Account.findByPk(id);
  if (!account) throw 'Account not found';
  return account;
}

async function getRefreshToken(token: any) {
  const refreshToken = await db.RefreshToken.findOne({ where: { token } });
  if (!refreshToken) throw 'Invalid token';
  return refreshToken;
}

function generateJwtToken(account: any) {
  return jwt.sign(
    { sub: account.id, id: account.id },
    secret,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(account: any, ipAddress: any) {
  return {
    accountId: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress
  };
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account: any) {
  const { id, title, firstName, lastName, email, role, isVerified } = account;
  return { id, title, firstName, lastName, email, role, isVerified };
}

async function sendVerificationEmail(account: any, origin: any) {
  const verifyUrl = `${origin}/verify-email?token=${account.verificationToken}`;
  await sendEmail({
    to: account.email,
    subject: 'Verify Email',
    html: `<h4>Verify Email</h4><p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
  });
}

async function sendAlreadyRegisteredEmail(email: any, origin: any) {
  await sendEmail({
    to: email,
    subject: 'Email Already Registered',
    html: `<h4>Email Already Registered</h4><p>Your email is already registered.</p>`
  });
}

async function sendPasswordResetEmail(account: any, origin: any) {
  const resetUrl = `${origin}/reset-password?token=${account.resetToken}`;
  await sendEmail({
    to: account.email,
    subject: 'Reset Password',
    html: `<h4>Reset Password</h4><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
  });
}