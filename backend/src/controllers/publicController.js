import SiteSettings from '../models/SiteSettings.js';
import GalleryItem from '../models/GalleryItem.js';
import Enquiry from '../models/Enquiry.js';
import ContactMessage from '../models/ContactMessage.js';
import path from 'node:path';
import fs from 'node:fs';
import { getBackendRoot } from '../config/env.js';
import Notice from '../models/Notice.js';
import AdmissionDocument from '../models/AdmissionDocument.js';
import Faculty from '../models/Faculty.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { syncEnquiryToGoogleSheet } from '../services/googleSheets.js';

export const health = (req, res) => res.json({ success: true, service: 'pnca-api', timestamp: new Date().toISOString() });

export const getPublicContent = asyncHandler(async (_req, res) => {
  const settings = await SiteSettings.findOne({ key: 'public' }).lean();
  res.json({ success: true, data: settings || null });
});

export const getPublicGallery = asyncHandler(async (_req, res) => {
  const items = await GalleryItem.find({ isPublished: true }).sort({ displayOrder: 1, createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: items });
});

export const getPublicFaculty = asyncHandler(async (_req, res) => {
  const items = await Faculty.find({ isPublished: true, isVerified: true })
    .select('fullName designation staffType department subjectsTaught qualifications specialization experienceYears joiningYear bio achievements languages email photoUrl imageAlt isFeatured displayOrder createdAt updatedAt')
    .sort({ isFeatured: -1, displayOrder: 1, fullName: 1 })
    .limit(200)
    .lean();
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json({ success: true, data: items.map((item) => ({
    ...item,
    photoUrl: item.photoUrl ? (item.photoUrl.startsWith('https://') ? item.photoUrl : `/api/faculty/${item._id}/photo`) : '',
  })) });
});

export const getPublicFacultyPhoto = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).json({ success: false, message: 'Faculty photograph not found.' });
  const item = await Faculty.findOne({ _id: req.params.id, isPublished: true, isVerified: true }).select('photoUrl').lean();
  if (!item?.photoUrl || item.photoUrl.startsWith('https://') || !item.photoUrl.startsWith('/uploads/faculty/')) {
    return res.status(404).json({ success: false, message: 'Faculty photograph not found.' });
  }
  const filename = path.basename(item.photoUrl);
  const filePath = path.join(getBackendRoot(), 'uploads', 'faculty', filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Faculty photograph is unavailable.' });
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.type(path.extname(filename).toLowerCase());
  return res.sendFile(filePath);
});

export const getPublicNotices = asyncHandler(async (_req, res) => {
  const now = new Date();
  const items = await Notice.find({
    isPublished: true,
    publishDate: { $lte: now },
    $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }],
  }).sort({ publishDate: -1, createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: items.map((item) => ({
    _id: item._id, title: item.title, body: item.body, publishDate: item.publishDate, expiresAt: item.expiresAt,
    attachmentUrl: item.attachmentUrl ? `/api/notices/${item._id}/file` : '', attachmentName: item.attachmentName || '',
  })) });
});

export const getPublicAdmissionDocuments = asyncHandler(async (_req, res) => {
  const items = await AdmissionDocument.find({ isPublished: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(100).lean();
  res.json({ success: true, data: items.map((item) => ({
    _id: item._id, title: item.title, description: item.description || '', category: item.category,
    fileUrl: `/api/admission-documents/${item._id}/file`, fileName: item.fileName || '', fileSize: item.fileSize || 0, createdAt: item.createdAt,
  })) });
});

function sendPdfFile(res, relativeUrl, fallbackName) {
  if (!relativeUrl || !relativeUrl.startsWith('/uploads/documents/')) return res.status(404).json({ success: false, message: 'Document not found.' });
  const filename = path.basename(relativeUrl);
  const filePath = path.join(getBackendRoot(), 'uploads', 'documents', filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'The document file is unavailable.' });
  res.type('application/pdf');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(fallbackName || 'school-document.pdf')}`);
  return res.sendFile(filePath);
}

export const downloadPublicNoticeAttachment = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).lean();
  const now = new Date();
  if (!notice || !notice.isPublished || notice.publishDate > now || (notice.expiresAt && notice.expiresAt < now) || !notice.attachmentUrl) {
    return res.status(404).json({ success: false, message: 'Notice attachment not found.' });
  }
  return sendPdfFile(res, notice.attachmentUrl, notice.attachmentName);
});

export const downloadPublicAdmissionDocument = asyncHandler(async (req, res) => {
  const document = await AdmissionDocument.findById(req.params.id).lean();
  if (!document || !document.isPublished || !document.fileUrl) {
    return res.status(404).json({ success: false, message: 'Admission document not found.' });
  }
  return sendPdfFile(res, document.fileUrl, document.fileName);
});

export const createEnquiry = asyncHandler(async (req, res) => {
  const { consent: _consent, ...data } = req.validatedBody;
  const enquiry = await Enquiry.create({
    ...data,
    consentAcceptedAt: new Date(),
    consentVersion: '2026-10-v2',
    googleSheetStatus: 'pending',
  });

  // MongoDB is the durable primary record. The sheet sync status is persisted,
  // so a transient Google failure never loses the enquiry or falsely reports sync.
  const sync = await syncEnquiryToGoogleSheet(enquiry);
  enquiry.googleSheetStatus = sync.status;
  enquiry.googleSheetSyncedAt = sync.syncedAt || null;
  enquiry.googleSheetLastError = sync.error || '';
  await enquiry.save();

  res.status(201).json({
    success: true,
    message: sync.status === 'synced'
      ? 'Thank you. Your enquiry has been received by the school office.'
      : 'Thank you. Your enquiry has been received. The school office will review it; external spreadsheet sync may be pending.',
    data: { id: enquiry._id, googleSheetStatus: enquiry.googleSheetStatus },
  });
});

export const createContactMessage = asyncHandler(async (req, res) => {
  const { consent: _consent, ...data } = req.validatedBody;
  const message = await ContactMessage.create({ ...data, consentAcceptedAt: new Date(), consentVersion: '2026-10-v2' });
  res.status(201).json({ success: true, message: 'Thank you for contacting the school. Your message has been received.', data: { id: message._id } });
});

export const recordNotFound = (req, res) => res.status(404).json({ success: false, message: 'The requested record was not found.' });
