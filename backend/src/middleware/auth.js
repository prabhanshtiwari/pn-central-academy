import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';
import { asyncHandler } from './asyncHandler.js';

export const requireAdmin = asyncHandler(async (req, res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : (req.cookies?.pnca_admin || '');
  if (!token) return res.status(401).json({ success: false, message: 'Please sign in to continue.' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'pnca-api', audience: 'pnca-admin' });
  } catch {
    return res.status(401).json({ success: false, message: 'Your session expired. Please sign in again.' });
  }
  const admin = await AdminUser.findById(payload.sub).select('_id email role');
  if (!admin || admin.role !== 'admin') return res.status(401).json({ success: false, message: 'Admin account not found.' });
  req.admin = admin;
  next();
});
