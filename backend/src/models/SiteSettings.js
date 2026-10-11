import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'public', unique: true, index: true },
  schoolName: { type: String, default: 'P.N. Central Academy', maxlength: 120 },
  heroEyebrow: { type: String, default: 'LEARN · LEAD · THRIVE', maxlength: 80 },
  heroTitle: { type: String, default: 'A strong foundation for a brighter future.', maxlength: 180 },
  heroSubtitle: { type: String, default: 'A supportive, student-centred learning environment in Saidabad, Prayagraj.', maxlength: 600 },
  introTitle: { type: String, default: 'Education with purpose. Character for life.', maxlength: 180 },
  introText: { type: String, default: 'P.N. Central Academy focuses on academic learning, discipline, curiosity and all-round development.', maxlength: 1500 },
  phonePrimary: { type: String, default: '9793404694', maxlength: 30 },
  phoneSecondary: { type: String, default: '8381978558', maxlength: 30 },
  phoneWhatsapp: { type: String, default: '9793404694', maxlength: 30 },
  email: { type: String, default: 'pncentralacademy01@gmail.com', maxlength: 254 },
  address: { type: String, default: 'Mauadih, Saidabad, Uttar Pradesh 221508', maxlength: 300 },
  admissionsOpen: { type: Boolean, default: true },
}, { timestamps: true, minimize: false });

export default mongoose.model('SiteSettings', siteSettingsSchema);
