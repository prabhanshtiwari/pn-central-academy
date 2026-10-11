import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser.js';
import SiteSettings from '../models/SiteSettings.js';
import { getBackendRoot } from '../config/env.js';

const initialSettings = {
  key: 'public', schoolName: 'P.N. Central Academy', heroEyebrow: 'LEARN · LEAD · THRIVE',
  heroTitle: 'A strong foundation for a brighter future.',
  heroSubtitle: 'A supportive, student-centred learning environment in Saidabad, Prayagraj.',
  introTitle: 'Education with purpose. Character for life.',
  introText: 'P.N. Central Academy focuses on academic learning, discipline, curiosity and all-round development.',
  phonePrimary: '9793404694', phoneSecondary: '8381978558', phoneWhatsapp: '9793404694', email: 'pncentralacademy01@gmail.com',
  address: 'Mauadih, Saidabad, Uttar Pradesh 221508', admissionsOpen: true,
};

export async function bootstrapData() {
  await SiteSettings.updateOne({ key: 'public' }, { $setOnInsert: initialSettings }, { upsert: true });

  const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@pncentralacademy.local').trim().toLowerCase();
  let admin = await AdminUser.findOne({ email: configuredEmail }).select('+passwordHash');
  const credentialPath = path.join(getBackendRoot(), '.admin-credentials');
  if (!admin && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    admin = await AdminUser.create({ email: configuredEmail, passwordHash, role: 'admin' });
    console.info(`Initial admin created for ${configuredEmail} using ADMIN_PASSWORD from environment.`);
  } else if (!admin) {
    const password = crypto.randomBytes(24).toString('base64url');
    const passwordHash = await bcrypt.hash(password, 12);
    admin = await AdminUser.create({ email: configuredEmail, passwordHash, role: 'admin' });
    const body = [
      'P.N. Central Academy admin credentials — keep this file private.',
      `Email: ${configuredEmail}`,
      `Password: ${password}`,
      'Change this password immediately after first login, or use the password change form in the admin dashboard.',
      'Delete this file after securely storing the credentials. It is ignored by Git.',
      '',
    ].join('\n');
    fs.writeFileSync(credentialPath, body, { mode: 0o600, flag: 'w' });
    try { fs.chmodSync(credentialPath, 0o600); } catch { /* Windows may not support POSIX modes. */ }
    console.info('Initial admin created. One-time credentials saved to backend/.admin-credentials.');
  }
}
