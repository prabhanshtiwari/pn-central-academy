import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  caption: { type: String, trim: true, maxlength: 400, default: '' },
  category: { type: String, trim: true, maxlength: 80, default: 'Campus life' },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  imageUrl: { type: String, required: true, trim: true, maxlength: 500 },
  source: { type: String, enum: ['upload', 'website', 'external'], default: 'upload' },
  isPublished: { type: Boolean, default: true, index: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

galleryItemSchema.index({ isPublished: 1, displayOrder: 1, createdAt: -1 });
export default mongoose.model('GalleryItem', galleryItemSchema);
