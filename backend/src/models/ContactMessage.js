import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 20, default: '' },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new', index: true },
  consentAcceptedAt: { type: Date, required: true },
  consentVersion: { type: String, required: true, default: '2026-10-v1' },
}, { timestamps: true });

contactMessageSchema.index({ createdAt: -1 });
export default mongoose.model('ContactMessage', contactMessageSchema);
