import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs/promises';
import path from 'node:path';
import AdminUser from '../models/AdminUser.js';
import Enquiry from '../models/Enquiry.js';
import ContactMessage from '../models/ContactMessage.js';
import GalleryItem from '../models/GalleryItem.js';
import SiteSettings from '../models/SiteSettings.js';
import Notice from '../models/Notice.js';
import AdmissionDocument from '../models/AdmissionDocument.js';
import Faculty from '../models/Faculty.js';
import { syncEnquiryToGoogleSheet } from '../services/googleSheets.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getBackendRoot } from '../config/env.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';

export const login = asyncHandler(async (req, res) => {
  const email = String(req.validatedBody.email).trim().toLowerCase();
  const admin = await AdminUser.findOne({ email }).select('+passwordHash');
  const matches = admin ? await bcrypt.compare(req.validatedBody.password, admin.passwordHash) : false;
  if (!matches || !admin) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

  admin.lastLoginAt = new Date();
  await admin.save();
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    subject: admin._id.toString(), issuer: 'pnca-api', audience: 'pnca-admin', expiresIn: '8h',
  });
  res.cookie('pnca_admin', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none', sameSite: process.env.COOKIE_SAME_SITE || 'lax', maxAge: 8 * 60 * 60 * 1000, path: '/' });
  res.json({ success: true, data: { admin: { id: admin._id, email: admin.email, role: admin.role }, expiresIn: 28800 } });
});

export const logout = (req, res) => {
  res.clearCookie('pnca_admin', { httpOnly: true, secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none', sameSite: process.env.COOKIE_SAME_SITE || 'lax', path: '/' });
  res.json({ success: true, message: 'Signed out.' });
};

export const changePassword = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin._id).select('+passwordHash');
  if (!admin) return res.status(404).json({ success: false, message: 'Admin account not found.' });
  const matches = await bcrypt.compare(req.validatedBody.currentPassword, admin.passwordHash);
  if (!matches) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  if (await bcrypt.compare(req.validatedBody.newPassword, admin.passwordHash)) {
    return res.status(422).json({ success: false, message: 'Choose a password different from the current one.' });
  }
  admin.passwordHash = await bcrypt.hash(req.validatedBody.newPassword, 12);
  await admin.save();
  res.json({ success: true, message: 'Password updated successfully.' });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [enquiriesTotal, enquiriesNew, messagesTotal, messagesNew, galleryTotal] = await Promise.all([
    Enquiry.countDocuments(), Enquiry.countDocuments({ status: 'new' }),
    ContactMessage.countDocuments(), ContactMessage.countDocuments({ status: 'new' }),
    GalleryItem.countDocuments(),
  ]);
  const [noticesTotal, admissionDocumentsTotal, googleSheetPending] = await Promise.all([
    Notice.countDocuments(), AdmissionDocument.countDocuments(), Enquiry.countDocuments({ $or: [{ googleSheetStatus: { $in: ['pending', 'failed'] } }, { googleSheetStatus: { $exists: false } }] }),
  ]);
  res.json({ success: true, data: { enquiriesTotal, enquiriesNew, messagesTotal, messagesNew, galleryTotal, noticesTotal, admissionDocumentsTotal, googleSheetPending } });
});

export const listEnquiries = asyncHandler(async (req, res) => {
  const { status, page = '1', limit = '50' } = req.query;
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const query = {};
  if (['new', 'contacted', 'admitted', 'closed'].includes(status)) query.status = status;
  const [items, total] = await Promise.all([
    Enquiry.find(query).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Enquiry.countDocuments(query),
  ]);
  res.json({ success: true, data: items, pagination: { page: safePage, limit: safeLimit, total } });
});

export const updateEnquiry = asyncHandler(async (req, res) => {
  const updated = await Enquiry.findByIdAndUpdate(req.params.id, { $set: req.validatedBody }, { new: true, runValidators: true }).lean();
  if (!updated) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
  res.json({ success: true, data: updated });
});

export const syncEnquiryToSheet = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
  const sync = await syncEnquiryToGoogleSheet(enquiry);
  enquiry.googleSheetStatus = sync.status;
  enquiry.googleSheetSyncedAt = sync.syncedAt || null;
  enquiry.googleSheetLastError = sync.error || '';
  await enquiry.save();
  res.status(sync.status === 'synced' ? 200 : 503).json({
    success: sync.status === 'synced',
    message: sync.status === 'synced' ? 'Enquiry synced to Google Sheets.' : (sync.error || 'Google Sheets sync is not complete.'),
    data: { googleSheetStatus: enquiry.googleSheetStatus, googleSheetSyncedAt: enquiry.googleSheetSyncedAt },
  });
});

const uploadedDocumentUrl = (file) => file ? `/uploads/documents/${file.filename}` : '';

async function verifyUploadedPdf(file) {
  if (!file) return true;
  let handle;
  try {
    handle = await fs.open(file.path, 'r');
    const signature = Buffer.alloc(5);
    const { bytesRead } = await handle.read(signature, 0, 5, 0);
    return bytesRead === 5 && signature.toString('ascii') === '%PDF-';
  } finally {
    if (handle) await handle.close();
  }
}

async function removeUploadedFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/documents/')) return;
  const target = path.join(getBackendRoot(), 'uploads', 'documents', path.basename(fileUrl));
  try { await fs.unlink(target); }
  catch (error) { if (error.code !== 'ENOENT') console.warn('Could not remove uploaded document:', error.message); }
}

export const listAdminNotices = asyncHandler(async (_req, res) => {
  const data = await Notice.find().sort({ publishDate: -1, createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: data.map((item) => ({ ...item, attachmentUrl: item.attachmentUrl ? `/api/admin/notices/${item._id}/file` : '' })) });
});

export const downloadAdminNoticeAttachment = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).lean();
  if (!notice || !notice.attachmentUrl || !notice.attachmentUrl.startsWith('/uploads/documents/')) return res.status(404).json({ success: false, message: 'Notice attachment not found.' });
  const filePath = path.join(getBackendRoot(), 'uploads', 'documents', path.basename(notice.attachmentUrl));
  try { await fs.access(filePath); } catch { return res.status(404).json({ success: false, message: 'The document file is unavailable.' }); }
  res.type('application/pdf');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(notice.attachmentName || 'notice.pdf')}`);
  return res.sendFile(filePath);
});

export const createNotice = asyncHandler(async (req, res) => {
  if (req.file && !(await verifyUploadedPdf(req.file))) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, message: 'The uploaded notice attachment is not a valid PDF file.' });
  }
  const body = req.validatedBody;
  if (body.expiresAt && new Date(body.expiresAt) < new Date(body.publishDate)) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(422).json({ success: false, message: 'The expiry date must be on or after the publication date.' });
  }
  let doc;
  try {
    doc = await Notice.create({
      title: body.title,
      body: body.body,
      publishDate: new Date(body.publishDate),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      attachmentUrl: uploadedDocumentUrl(req.file),
      attachmentName: req.file ? path.basename(req.file.originalname).slice(0, 180) : '',
      isPublished: body.isPublished ?? true,
      createdBy: req.admin._id,
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
  res.status(201).json({ success: true, data: doc });
});

export const updateNotice = asyncHandler(async (req, res) => {
  if (req.file && !(await verifyUploadedPdf(req.file))) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, message: 'The uploaded notice attachment is not a valid PDF file.' });
  }
  const existing = await Notice.findById(req.params.id);
  if (!existing) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }
  const oldAttachmentUrl = existing.attachmentUrl;
  const patch = { ...req.validatedBody };
  const proposedPublishDate = Object.hasOwn(patch, 'publishDate') ? new Date(patch.publishDate) : existing.publishDate;
  const proposedExpiryDate = Object.hasOwn(patch, 'expiresAt') ? (patch.expiresAt ? new Date(patch.expiresAt) : null) : existing.expiresAt;
  if (proposedExpiryDate && proposedExpiryDate < proposedPublishDate) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(422).json({ success: false, message: 'The expiry date must be on or after the publication date.' });
  }
  if (Object.hasOwn(patch, 'publishDate')) patch.publishDate = new Date(patch.publishDate);
  if (Object.hasOwn(patch, 'expiresAt')) patch.expiresAt = patch.expiresAt ? new Date(patch.expiresAt) : null;
  if (req.file) {
    patch.attachmentUrl = uploadedDocumentUrl(req.file);
    patch.attachmentName = path.basename(req.file.originalname).slice(0, 180);
  }
  Object.assign(existing, patch);
  await existing.save();
  if (req.file) await removeUploadedFile(oldAttachmentUrl);
  res.json({ success: true, data: existing });
});

export const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
  await removeUploadedFile(notice.attachmentUrl);
  res.json({ success: true, message: 'Notice deleted.' });
});

export const listAdminAdmissionDocuments = asyncHandler(async (_req, res) => {
  const data = await AdmissionDocument.find().sort({ displayOrder: 1, createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: data.map((item) => ({ ...item, fileUrl: `/api/admin/admission-documents/${item._id}/file` })) });
});

export const downloadAdminAdmissionDocument = asyncHandler(async (req, res) => {
  const document = await AdmissionDocument.findById(req.params.id).lean();
  if (!document || !document.fileUrl || !document.fileUrl.startsWith('/uploads/documents/')) return res.status(404).json({ success: false, message: 'Admission document not found.' });
  const filePath = path.join(getBackendRoot(), 'uploads', 'documents', path.basename(document.fileUrl));
  try { await fs.access(filePath); } catch { return res.status(404).json({ success: false, message: 'The document file is unavailable.' }); }
  res.type('application/pdf');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(document.fileName || 'admission-document.pdf')}`);
  return res.sendFile(filePath);
});

export const createAdmissionDocument = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(422).json({ success: false, message: 'Choose a PDF document to upload.' });
  if (!(await verifyUploadedPdf(req.file))) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, message: 'The uploaded document is not a valid PDF file.' });
  }
  const body = req.validatedBody;
  let doc;
  try {
    doc = await AdmissionDocument.create({
      title: body.title,
      description: body.description || '',
      category: body.category,
      fileUrl: uploadedDocumentUrl(req.file),
      fileName: path.basename(req.file.originalname).slice(0, 180),
      fileSize: req.file.size,
      isPublished: body.isPublished ?? true,
      displayOrder: body.displayOrder ?? 0,
      createdBy: req.admin._id,
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
  res.status(201).json({ success: true, data: doc });
});

export const updateAdmissionDocument = asyncHandler(async (req, res) => {
  if (req.file && !(await verifyUploadedPdf(req.file))) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, message: 'The uploaded document is not a valid PDF file.' });
  }
  const existing = await AdmissionDocument.findById(req.params.id);
  if (!existing) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(404).json({ success: false, message: 'Admission document not found.' });
  }
  const oldFileUrl = existing.fileUrl;
  const patch = { ...req.validatedBody };
  if (req.file) {
    patch.fileUrl = uploadedDocumentUrl(req.file);
    patch.fileName = path.basename(req.file.originalname).slice(0, 180);
    patch.fileSize = req.file.size;
  }
  Object.assign(existing, patch);
  await existing.save();
  if (req.file) await removeUploadedFile(oldFileUrl);
  res.json({ success: true, data: existing });
});

export const deleteAdmissionDocument = asyncHandler(async (req, res) => {
  const doc = await AdmissionDocument.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Admission document not found.' });
  await removeUploadedFile(doc.fileUrl);
  res.json({ success: true, message: 'Admission document deleted.' });
});

export const listMessages = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (['new', 'read', 'replied', 'closed'].includes(status)) query.status = status;
  const items = await ContactMessage.find(query).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: items });
});

export const updateMessage = asyncHandler(async (req, res) => {
  const updated = await ContactMessage.findByIdAndUpdate(req.params.id, { $set: req.validatedBody }, { new: true, runValidators: true }).lean();
  if (!updated) return res.status(404).json({ success: false, message: 'Message not found.' });
  res.json({ success: true, data: updated });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const updated = await SiteSettings.findOneAndUpdate({ key: 'public' }, { $set: req.validatedBody }, { new: true, upsert: true, runValidators: true }).lean();
  res.json({ success: true, data: updated });
});

export const listAdminGallery = asyncHandler(async (req, res) => {
  const data = await GalleryItem.find().sort({ displayOrder: 1, createdAt: -1 }).limit(150).lean();
  res.json({ success: true, data });
});

export const addGalleryUpload = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(422).json({ success: false, message: 'Choose an image to upload.' });

  // Do not trust the browser-supplied MIME type alone; validate the actual file signature.
  let handle;
  let signature;
  try {
    handle = await fs.open(req.file.path, 'r');
    signature = Buffer.alloc(12);
    await handle.read(signature, 0, signature.length, 0);
  } finally {
    if (handle) await handle.close();
  }
  const isPng = signature.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const isGif = signature.subarray(0, 6).toString('ascii') === 'GIF87a' || signature.subarray(0, 6).toString('ascii') === 'GIF89a';
  const isWebp = signature.subarray(0, 4).toString('ascii') === 'RIFF' && signature.subarray(8, 12).toString('ascii') === 'WEBP';
  const detectedMime = isPng ? 'image/png' : isJpeg ? 'image/jpeg' : isGif ? 'image/gif' : isWebp ? 'image/webp' : null;
  if (!detectedMime || detectedMime !== req.file.mimetype) {
    try { await fs.unlink(req.file.path); } catch (error) { if (error.code !== 'ENOENT') console.warn('Could not remove rejected upload:', error.message); }
    return res.status(400).json({ success: false, message: 'The image file content does not match its declared image type.' });
  }

  let cloudAsset = null;
  try { cloudAsset = await uploadToCloudinary(req.file, 'gallery'); }
  catch (error) { await fs.unlink(req.file.path).catch(() => {}); throw error; }
  const title = String(req.body.title || req.file.originalname.replace(/\.[^.]+$/, '')).trim().slice(0, 120) || 'School gallery';
  const caption = String(req.body.caption || '').trim().slice(0, 400);
  const category = String(req.body.category || 'Campus life').trim().slice(0, 80);
  const item = await GalleryItem.create({
    title, caption, category, type: 'image', imageUrl: cloudAsset?.url || `/uploads/gallery/${req.file.filename}`,
    source: 'upload', isPublished: true,
  });
  if (cloudAsset) await fs.unlink(req.file.path).catch(() => {});
  res.status(201).json({ success: true, data: item });
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found.' });
  if (item.imageUrl.startsWith('https://res.cloudinary.com/')) await deleteFromCloudinary(item.imageUrl).catch((error) => console.warn('Cloudinary gallery cleanup failed:', error.message));
  if (item.imageUrl.startsWith('/uploads/gallery/')) {
    const file = path.join(getBackendRoot(), 'uploads', 'gallery', path.basename(item.imageUrl));
    try { await fs.unlink(file); } catch (error) { if (error.code !== 'ENOENT') console.warn('Could not remove uploaded gallery asset:', error.message); }
  }
  res.json({ success: true, message: 'Gallery item deleted.' });
});

const facultyImageUrl = (file, cloudAsset) => file ? (cloudAsset?.url || `/uploads/faculty/${file.filename}`) : '';

async function verifyUploadedImage(file) {
  if (!file) return true;
  let handle;
  try {
    handle = await fs.open(file.path, 'r');
    const signature = Buffer.alloc(12);
    const { bytesRead } = await handle.read(signature, 0, signature.length, 0);
    const isPng = bytesRead >= 8 && signature.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isJpeg = bytesRead >= 3 && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
    const isGif = bytesRead >= 6 && ['GIF87a', 'GIF89a'].includes(signature.subarray(0, 6).toString('ascii'));
    const isWebp = bytesRead >= 12 && signature.subarray(0, 4).toString('ascii') === 'RIFF' && signature.subarray(8, 12).toString('ascii') === 'WEBP';
    const detectedMime = isPng ? 'image/png' : isJpeg ? 'image/jpeg' : isGif ? 'image/gif' : isWebp ? 'image/webp' : null;
    return Boolean(detectedMime && detectedMime === file.mimetype);
  } finally {
    if (handle) await handle.close();
  }
}

async function removeFacultyPhoto(photoUrl) {
  if (photoUrl?.startsWith('https://res.cloudinary.com/')) { await deleteFromCloudinary(photoUrl).catch((error) => console.warn('Cloudinary faculty cleanup failed:', error.message)); return; }
  if (!photoUrl || !photoUrl.startsWith('/uploads/faculty/')) return;
  const target = path.join(getBackendRoot(), 'uploads', 'faculty', path.basename(photoUrl));
  try { await fs.unlink(target); }
  catch (error) { if (error.code !== 'ENOENT') console.warn('Could not remove faculty photo:', error.message); }
}

const serializeAdminFaculty = (item) => ({
  ...item,
  photoUrl: item.photoUrl ? (item.photoUrl.startsWith('https://') ? item.photoUrl : `/api/admin/faculty/${item._id}/photo`) : '',
});

export const listAdminFaculty = asyncHandler(async (_req, res) => {
  const items = await Faculty.find().sort({ displayOrder: 1, fullName: 1 }).limit(500).lean();
  res.json({ success: true, data: items.map(serializeAdminFaculty) });
});

export const getAdminFacultyPhoto = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).json({ success: false, message: 'Faculty photograph not found.' });
  const item = await Faculty.findById(req.params.id).select('photoUrl').lean();
  if (!item?.photoUrl || item.photoUrl.startsWith('https://') || !item.photoUrl.startsWith('/uploads/faculty/')) {
    return res.status(404).json({ success: false, message: 'Faculty photograph not found.' });
  }
  const filename = path.basename(item.photoUrl);
  const filePath = path.join(getBackendRoot(), 'uploads', 'faculty', filename);
  try { await fs.access(filePath); }
  catch { return res.status(404).json({ success: false, message: 'Faculty photograph is unavailable.' }); }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');
  res.type(path.extname(filename).toLowerCase());
  return res.sendFile(filePath);
});

export const createFacultyMember = asyncHandler(async (req, res) => {
  if (req.file && !(await verifyUploadedImage(req.file))) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, message: 'The photo content does not match a supported image type.' });
  }
  let cloudAsset = null;
  try { if (req.file) cloudAsset = await uploadToCloudinary(req.file, 'faculty'); }
  catch (error) { if (req.file) await fs.unlink(req.file.path).catch(() => {}); throw error; }
  const body = req.validatedBody;
  if (body.isPublished && !body.isVerified) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    if (cloudAsset) await deleteFromCloudinary(cloudAsset.url).catch(() => {});
    return res.status(422).json({ success: false, message: 'Verify the faculty member before publishing this profile.' });
  }
  let item;
  try {
    item = await Faculty.create({
      ...body,
      photoUrl: facultyImageUrl(req.file, cloudAsset),
      imageAlt: req.file ? `${body.fullName}, ${body.designation}` : '',
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
  if (cloudAsset && req.file) await fs.unlink(req.file.path).catch(() => {});
  res.status(201).json({ success: true, data: serializeAdminFaculty(item.toObject()) });
});

export const updateFacultyMember = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
  }
  if (req.file && !(await verifyUploadedImage(req.file))) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, message: 'The photo content does not match a supported image type.' });
  }
  let cloudAsset = null;
  try { if (req.file) cloudAsset = await uploadToCloudinary(req.file, 'faculty'); }
  catch (error) { if (req.file) await fs.unlink(req.file.path).catch(() => {}); throw error; }
  const item = await Faculty.findById(req.params.id);
  if (!item) {
    if (cloudAsset) await deleteFromCloudinary(cloudAsset.url).catch(() => {});
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
  }
  const body = { ...req.validatedBody };
  const nextVerified = Object.hasOwn(body, 'isVerified') ? body.isVerified : item.isVerified;
  const nextPublished = Object.hasOwn(body, 'isPublished') ? body.isPublished : item.isPublished;
  if (nextPublished && !nextVerified) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    if (cloudAsset) await deleteFromCloudinary(cloudAsset.url).catch(() => {});
    return res.status(422).json({ success: false, message: 'A faculty profile must be verified by the school before it can be published.' });
  }
  const oldPhotoUrl = item.photoUrl;
  const removePhoto = body.removePhoto === true;
  delete body.removePhoto;
  Object.assign(item, body, { updatedBy: req.admin._id });
  if (req.file) {
    item.photoUrl = facultyImageUrl(req.file, cloudAsset);
    item.imageAlt = `${item.fullName}, ${item.designation}`;
  } else if (removePhoto) {
    item.photoUrl = '';
    item.imageAlt = '';
  }
  try {
    await item.save();
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
  if (cloudAsset && req.file) await fs.unlink(req.file.path).catch(() => {});
  if ((req.file || removePhoto) && oldPhotoUrl && oldPhotoUrl !== item.photoUrl) await removeFacultyPhoto(oldPhotoUrl);
  res.json({ success: true, data: serializeAdminFaculty(item.toObject()) });
});

export const deleteFacultyMember = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
  const item = await Faculty.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
  await removeFacultyPhoto(item.photoUrl);
  res.json({ success: true, message: 'Faculty profile deleted.' });
});

