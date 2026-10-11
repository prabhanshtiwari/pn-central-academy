import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  body: { type: String, required: true, trim: true, maxlength: 8000 },
  publishDate: { type: Date, required: true, index: true },
  expiresAt: { type: Date, default: null },
  attachmentUrl: { type: String, trim: true, maxlength: 500, default: '' },
  attachmentName: { type: String, trim: true, maxlength: 180, default: '' },
  isPublished: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true });

noticeSchema.index({ isPublished: 1, publishDate: -1, expiresAt: 1 });
export default mongoose.model('Notice', noticeSchema);
