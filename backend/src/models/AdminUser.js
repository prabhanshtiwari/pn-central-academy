import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin'], default: 'admin' },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('AdminUser', adminUserSchema);
