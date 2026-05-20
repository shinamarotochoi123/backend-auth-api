// _middleware/authorize.ts
import { expressjwt } from 'express-jwt';
import db from '../_helpers/db';

// Use environment variable for secret
const secret = process.env.JWT_SECRET || 'your_secret_key';

export default authorize;

function authorize(roles: string[] | string = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // Verify JWT token
    expressjwt({ secret, algorithms: ['HS256'] }),
    
    // Authorize based on user role
    async (req: any, res: any, next: any) => {
      const account = await db.Account.findByPk(req.auth.id);

      if (!account || (roles.length && !roles.includes(account.role))) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.auth.role = account.role;
      const refreshTokens = await account.getRefreshTokens();
      req.auth.ownsToken = (token: string) =>
        !!refreshTokens.find((x: any) => x.token === token);

      next();
    }
  ];
}