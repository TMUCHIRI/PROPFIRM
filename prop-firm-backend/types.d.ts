import { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: string | CustomJwtPayload;
    }
  }
}