import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export function signJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function createToken(user) {
  return signJWT({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}

export async function getUserFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;
  
  const decoded = verifyJWT(token);
  if (!decoded) return null;
  
  return {
    userId: decoded.userId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
}

export async function requireAuth(request, allowedRoles = []) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return { error: 'Authentication required', status: 401 };
  }
  
  const decoded = verifyJWT(token);
  if (!decoded) {
    return { error: 'Invalid or expired token', status: 401 };
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }
  
  return { user: decoded };
}

export function verifyAuth(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    return verifyJWT(token);
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

