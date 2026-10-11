import mongoose from 'mongoose';

const admissionDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 1200, default: '' },
  category: {
    type: String,
    enum: ['prospectus', 'admission-form', 'fee-structure', 'required-documents', 'other'],
    default: 'other',
    index: true,
  },
  fileUrl: { type: String, required: true, trim: true, maxlength: 500 },
  fileName: { type: String, required: true, trim: true, maxlength: 180 },
  fileSize: { type: Number, min: 0, default: 0 },
  isPublished: { type: Boolean, default: true, index: true },
  displayOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true });

admissionDocumentSchema.index({ isPublished: 1, displayOrder: 1, createdAt: -1 });
export default mongoose.model('AdmissionDocument', admissionDocumentSchema);
