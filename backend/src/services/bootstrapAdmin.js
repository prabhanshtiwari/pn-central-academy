
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser.js';
import SiteSettings from '../models/SiteSettings.js';

const initialSettings = {
  key: 'public',
  schoolName: 'P.N. Central Academy',
  heroEyebrow: 'LEARN · LEAD · THRIVE',
  heroTitle: 'A strong foundation for a brighter future.',
  heroSubtitle:
    'A supportive, student-centred learning environment in Saidabad, Prayagraj.',
  introTitle: 'Education with purpose. Character for life.',
  introText:
    'P.N. Central Academy focuses on academic learning, discipline, curiosity and all-round development.',
  phonePrimary: '9793404694',
  phoneSecondary: '8381978558',
  phoneWhatsapp: '9793404694',
  email: 'pncentralacademy01@gmail.com',
  address: 'Mauadih, Saidabad, Uttar Pradesh 221508',
  admissionsOpen: true,
};

export async function bootstrapData() {
  // Read the only authorized administrator credentials from the environment.
  const email = String(process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();

  const password = String(process.env.ADMIN_PASSWORD || '');

  // Never create an administrator using fallback credentials.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      'Invalid or missing ADMIN_EMAIL. Configure it in the backend environment.'
    );
  }

  if (password.length < 12) {
    throw new Error(
      'ADMIN_PASSWORD must contain at least 12 characters. Configure it in the backend environment.'
    );
  }

  // Initialize public website settings without overwriting existing settings.
  await SiteSettings.updateOne(
    { key: 'public' },
    { $setOnInsert: initialSettings },
    { upsert: true }
  );

  // Find the one administrator configured in the environment.
  let admin = await AdminUser.findOne({ email }).select('+passwordHash');

  // Always apply the backend environment password.
  // This resets an outdated database password after deployment/startup.
  const passwordHash = await bcrypt.hash(password, 12);

  if (admin) {
    admin.passwordHash = passwordHash;
    admin.role = 'admin';

    await admin.save();

    console.info(
      `Administrator credentials synchronized for ${email}.`
    );
  } else {
    // Create the configured administrator if it does not exist.
    admin = await AdminUser.create({
      email,
      passwordHash,
      role: 'admin',
    });

    console.info(
      `Administrator created from backend environment for ${email}.`
    );
  }

  // Delete other administrator accounts.
  // This only affects documents in the AdminUser collection.
  const cleanup = await AdminUser.deleteMany({
    _id: { $ne: admin._id },
  });

  if (cleanup.deletedCount > 0) {
    console.info(
      `Removed ${cleanup.deletedCount} obsolete administrator account(s).`
    );
  }

  console.info('Administrator initialization completed successfully.');
}
