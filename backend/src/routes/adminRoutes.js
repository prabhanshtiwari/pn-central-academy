import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "node:url";

import {
  login,
  logout,
  getDashboardStats,
  listEnquiries,
  updateEnquiry,
  syncEnquiryToSheet,
  listMessages,
  updateMessage,
  updateSettings,
  listAdminGallery,
  addGalleryUpload,
  deleteGalleryItem,
  listAdminNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  listAdminAdmissionDocuments,
  createAdmissionDocument,
  updateAdmissionDocument,
  deleteAdmissionDocument,
  downloadAdminNoticeAttachment,
  downloadAdminAdmissionDocument,
  listAdminFaculty,
  getAdminFacultyPhoto,
  createFacultyMember,
  updateFacultyMember,
  deleteFacultyMember,
} from "../controllers/adminController.js";

import { requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const uploadDir = path.join(root, "uploads", "gallery");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extensionByMime = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    const extension =
      extensionByMime[file.mimetype] ||
      path.extname(file.originalname).toLowerCase();
    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`,
    );
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const valid = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ].includes(file.mimetype);
    callback(
      valid
        ? null
        : new Error(
            "Only JPG, PNG, WEBP, or GIF images up to 8 MB are accepted.",
          ),
      valid,
    );
  },
});

const facultyDir = path.join(root, "uploads", "faculty");
fs.mkdirSync(facultyDir, { recursive: true });
const facultyStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, facultyDir),
  filename: (_req, file, callback) => {
    const extensionByMime = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    const extension = extensionByMime[file.mimetype];
    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${extension}`,
    );
  },
});
const facultyPhotoUpload = multer({
  storage: facultyStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const valid = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ].includes(file.mimetype);
    callback(
      valid
        ? null
        : new Error(
            "Only JPG, PNG, WEBP, or GIF profile photos up to 5 MB are accepted.",
          ),
      valid,
    );
  },
});

const documentsDir = path.join(root, "uploads", "documents");
fs.mkdirSync(documentsDir, { recursive: true });
const documentStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, documentsDir),
  filename: (_req, file, callback) =>
    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(16).toString("hex")}.pdf`,
    ),
});
const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const fileNameIsPdf =
      path.extname(file.originalname || "").toLowerCase() === ".pdf";
    const valid = file.mimetype === "application/pdf" && fileNameIsPdf;
    callback(
      valid ? null : new Error("Only PDF documents up to 15 MB are accepted."),
      valid,
    );
  },
});

const booleanField = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());
const dateField = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .refine((value) => Number.isFinite(Date.parse(value)), "Enter a valid date.");
const optionalDateField = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  dateField.optional(),
);
const noticeCreateSchema = z.object({
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(3).max(8000),
  publishDate: dateField,
  expiresAt: optionalDateField,
  isPublished: booleanField.optional().transform((value) => value ?? true),
});
const noticeUpdateSchema = noticeCreateSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );
const documentCreateSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z
    .preprocess(
      (value) => (value == null ? "" : value),
      z.string().trim().max(1200),
    )
    .optional()
    .default(""),
  category: z.enum([
    "prospectus",
    "admission-form",
    "fee-structure",
    "required-documents",
    "other",
  ]),
  isPublished: booleanField.optional().transform((value) => value ?? true),
  displayOrder: z
    .preprocess(
      (value) => (value === "" || value == null ? 0 : Number(value)),
      z.number().int().min(0).max(10000),
    )
    .optional()
    .default(0),
});
const documentUpdateSchema = documentCreateSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

const facultyBodySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  designation: z.string().trim().min(2).max(100),
  staffType: z.enum(["teaching", "non-teaching"]),
  department: z.string().trim().max(100).optional().default(""),
  subjectsTaught: z.string().trim().max(250).optional().default(""),
  qualifications: z.string().trim().max(300).optional().default(""),
  specialization: z.string().trim().max(250).optional().default(""),
  experienceYears: z
    .preprocess(
      (value) => (value === "" || value == null ? 0 : Number(value)),
      z.number().int().min(0).max(60),
    )
    .optional(),
  joiningYear: z
    .preprocess(
      (value) => (value === "" || value == null ? null : Number(value)),
      z.number().int().min(1950).max(new Date().getFullYear()).nullable(),
    )
    .optional(),
  bio: z.string().trim().max(2000).optional().default(""),
  achievements: z.string().trim().max(1200).optional().default(""),
  languages: z.string().trim().max(250).optional().default(""),
  email: z
    .union([z.string().trim().email().max(254), z.literal("")])
    .optional()
    .default(""),
  displayOrder: z
    .preprocess(
      (value) => (value === "" || value == null ? 0 : Number(value)),
      z.number().int().min(0).max(10000),
    )
    .optional(),
  isVerified: booleanField.optional().transform((value) => value ?? false),
  isPublished: booleanField.optional().transform((value) => value ?? false),
  isFeatured: booleanField.optional().transform((value) => value ?? false),
  removePhoto: booleanField.optional().transform((value) => value ?? false),
});
const facultyCreateSchema = facultyBodySchema;
const facultyUpdateSchema = facultyBodySchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

const validateUploadedBody = (schema) => async (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    if (req.file?.path) await fsp.unlink(req.file.path).catch(() => {});
    return res
      .status(422)
      .json({
        success: false,
        message: "Please correct the submitted fields.",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
  }
  req.validatedBody = parsed.data;
  next();
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

const enquiryUpdateSchema = z
  .object({
    status: z.enum(["new", "contacted", "admitted", "closed"]).optional(),
    adminNotes: z.string().trim().max(2000).optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one update is required",
  );
const messageUpdateSchema = z
  .object({
    status: z.enum(["new", "read", "replied", "closed"]).optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one update is required",
  );
const settingsSchema = z
  .object({
    schoolName: z.string().trim().min(2).max(120).optional(),
    heroEyebrow: z.string().trim().max(80).optional(),
    heroTitle: z.string().trim().min(8).max(180).optional(),
    heroSubtitle: z.string().trim().max(600).optional(),
    introTitle: z.string().trim().max(180).optional(),
    introText: z.string().trim().max(1500).optional(),
    phonePrimary: z.string().trim().max(30).optional(),
    phoneSecondary: z.string().trim().max(30).optional(),
    phoneWhatsapp: z.string().trim().max(30).optional(),
    email: z.string().trim().email().max(254).optional(),
    address: z.string().trim().max(300).optional(),
    admissionsOpen: z.boolean().optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one setting is required",
  );

router.post("/login", loginLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.use(requireAdmin);

router.get("/stats", getDashboardStats);
router.get("/enquiries", listEnquiries);
router.patch(
  "/enquiries/:id",
  validateBody(enquiryUpdateSchema),
  updateEnquiry,
);
router.post("/enquiries/:id/sync-google-sheet", syncEnquiryToSheet);
router.get("/messages", listMessages);
router.patch("/messages/:id", validateBody(messageUpdateSchema), updateMessage);
router.patch("/settings", validateBody(settingsSchema), updateSettings);
router.get("/gallery", listAdminGallery);
router.post("/gallery", upload.single("image"), addGalleryUpload);
router.delete("/gallery/:id", deleteGalleryItem);
router.get("/notices", listAdminNotices);
router.get("/notices/:id/file", downloadAdminNoticeAttachment);
router.post(
  "/notices",
  documentUpload.single("document"),
  validateUploadedBody(noticeCreateSchema),
  createNotice,
);
router.patch(
  "/notices/:id",
  documentUpload.single("document"),
  validateUploadedBody(noticeUpdateSchema),
  updateNotice,
);
router.delete("/notices/:id", deleteNotice);
router.get("/admission-documents", listAdminAdmissionDocuments);
router.get("/admission-documents/:id/file", downloadAdminAdmissionDocument);
router.post(
  "/admission-documents",
  documentUpload.single("document"),
  validateUploadedBody(documentCreateSchema),
  createAdmissionDocument,
);
router.patch(
  "/admission-documents/:id",
  documentUpload.single("document"),
  validateUploadedBody(documentUpdateSchema),
  updateAdmissionDocument,
);
router.delete("/admission-documents/:id", deleteAdmissionDocument);
router.get("/faculty", listAdminFaculty);
router.get("/faculty/:id/photo", getAdminFacultyPhoto);
router.post(
  "/faculty",
  facultyPhotoUpload.single("photo"),
  validateUploadedBody(facultyCreateSchema),
  createFacultyMember,
);
router.patch(
  "/faculty/:id",
  facultyPhotoUpload.single("photo"),
  validateUploadedBody(facultyUpdateSchema),
  updateFacultyMember,
);
router.delete("/faculty/:id", deleteFacultyMember);

export default router;
