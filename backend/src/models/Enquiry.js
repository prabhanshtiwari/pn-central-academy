import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  guardianName: { type: String, required: true, trim: true, maxlength: 100 },
  studentName: { type: String, trim: true, maxlength: 100, default: '' },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
  address: { type: String, trim: true, maxlength: 300, default: '' },
  classInterested: { type: String, required: true, trim: true, maxlength: 40 },
  message: { type: String, trim: true, maxlength: 1500, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'admitted', 'closed'], default: 'new', index: true },
  adminNotes: { type: String, trim: true, maxlength: 2000, default: '' },
  source: { type: String, enum: ['website', 'phone', 'walk-in', 'other'], default: 'website' },
  consentAcceptedAt: { type: Date, required: true },
  consentVersion: { type: String, required: true, default: '2026-10-v2' },
  googleSheetStatus: { type: String, enum: ['pending', 'synced', 'failed'], default: 'pending', index: true },
  googleSheetSyncedAt: { type: Date, default: null },
  googleSheetLastError: { type: String, trim: true, maxlength: 300, default: '' },
}, { timestamps: true });

enquirySchema.index({ createdAt: -1 });
export default mongoose.model('Enquiry', enquirySchema);
