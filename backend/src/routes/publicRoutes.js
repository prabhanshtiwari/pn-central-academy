import { Router } from 'express';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { health, getPublicContent, getPublicGallery, getPublicFaculty, getPublicFacultyPhoto, getPublicNotices, getPublicAdmissionDocuments, downloadPublicNoticeAttachment, downloadPublicAdmissionDocument, createEnquiry, createContactMessage } from '../controllers/publicController.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many submissions. Please wait a few minutes and try again.' } });
const phonePattern = /^[+()\-\s\d]{7,20}$/;
const emailPattern = z.string().trim().email().max(254);
const enquirySchema = z.object({
  guardianName: z.string().trim().min(2).max(100),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm consent before submitting.' }) }),
  studentName: z.string().trim().max(100).optional().default(''),
  phone: z.string().trim().regex(phonePattern, 'Enter a valid phone number'),
  email: z.union([emailPattern, z.literal('')]).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
  classInterested: z.string().trim().min(1).max(40),
  message: z.string().trim().max(1500).optional().default(''),
});
const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm consent before submitting.' }) }),
  email: emailPattern,
  phone: z.string().trim().regex(phonePattern, 'Enter a valid phone number').optional().or(z.literal('')).default(''),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
});
const rejectHoneypot = (req, res, next) => {
  if (typeof req.body?.website === 'string' && req.body.website.trim()) {
    return res.status(201).json({ success: true, message: 'Thank you. Your message has been received.' });
  }
  next();
};

router.get('/health', health);
router.get('/content', getPublicContent);
router.get('/gallery', getPublicGallery);
router.get('/faculty', getPublicFaculty);
router.get('/faculty/:id/photo', getPublicFacultyPhoto);
router.get('/notices', getPublicNotices);
router.get('/notices/:id/file', downloadPublicNoticeAttachment);
router.get('/admission-documents', getPublicAdmissionDocuments);
router.get('/admission-documents/:id/file', downloadPublicAdmissionDocument);
router.post('/enquiries', formLimiter, rejectHoneypot, validateBody(enquirySchema), createEnquiry);
router.post('/contact', formLimiter, rejectHoneypot, validateBody(contactSchema), createContactMessage);

export default router;
