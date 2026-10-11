import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120, index: true },
  designation: { type: String, required: true, trim: true, maxlength: 100 },
  staffType: { type: String, enum: ['teaching', 'non-teaching'], required: true, default: 'teaching', index: true },
  department: { type: String, trim: true, maxlength: 100, default: '' },
  subjectsTaught: { type: String, trim: true, maxlength: 250, default: '' },
  qualifications: { type: String, trim: true, maxlength: 300, default: '' },
  specialization: { type: String, trim: true, maxlength: 250, default: '' },
  experienceYears: { type: Number, min: 0, max: 60, default: 0 },
  joiningYear: { type: Number, min: 1950, max: 2100, default: null },
  bio: { type: String, trim: true, maxlength: 2000, default: '' },
  achievements: { type: String, trim: true, maxlength: 1200, default: '' },
  languages: { type: String, trim: true, maxlength: 250, default: '' },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
  photoUrl: { type: String, trim: true, maxlength: 500, default: '' },
  imageAlt: { type: String, trim: true, maxlength: 180, default: '' },
  isVerified: { type: Boolean, default: false, index: true },
  isPublished: { type: Boolean, default: false, index: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, min: 0, max: 10000, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true, versionKey: false });

facultySchema.index({ isPublished: 1, isVerified: 1, isFeatured: -1, displayOrder: 1, fullName: 1 });
facultySchema.index({ staffType: 1, department: 1, isPublished: 1, isVerified: 1 });

export default mongoose.model('Faculty', facultySchema);
