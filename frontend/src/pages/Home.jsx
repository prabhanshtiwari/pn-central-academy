import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, ChevronDown, FlaskConical,
  GraduationCap, HeartHandshake, Laptop, Leaf, Monitor, Music2, ShieldCheck,
  Sparkles, Trophy, Users, BookMarked, Quote, MapPin,
} from 'lucide-react';
import AssetImage from '../components/AssetImage';
import EnquiryForm from '../components/EnquiryForm';
import api from '../lib/api';
import { useSite } from '../components/SiteContext';
import { facilities, galleryFallback, aboutText, directorMessage, principalMessage, school } from '../data/site';

const iconMap = { Monitor, FlaskConical, Laptop, BookOpen, Music2, Trophy };

// These photographs/illustrations are already included in this project's local asset mirror.
const facilityImages = {
  Monitor: { src: '/assets/site-mirror/1a338c325d-smart.png', alt: 'Smart classroom at the academy' },
  FlaskConical: { src: '/assets/site-mirror/5288f88c9a-sciecelab.jpg', alt: 'Students carrying out practical science work' },
  Laptop: { src: '/assets/site-mirror/e3170fdc08-about.png', alt: 'Students working in the computer laboratory' },
  BookOpen: { src: '/assets/site-mirror/1cb6c6462b-lib.png', alt: 'Library illustration from the school asset collection' },
  Music2: { src: '/assets/site-mirror/2438f75dbc-music.png', alt: 'Music and arts equipment at the academy' },
  Trophy: { src: '/assets/site-mirror/42b584405b-paly.png', alt: 'Students taking part in outdoor activities' },
};

export default function Home() {
  const { settings } = useSite();
  const [galleryItems, setGalleryItems] = useState(galleryFallback);
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { src: '/assets/hero-campus.png', fallback: galleryFallback[0].fallback, eyebrow: settings.heroEyebrow || 'LEARN · LEAD · THRIVE', title: settings.heroTitle || 'A strong foundation for a brighter future.', text: settings.heroSubtitle || 'A supportive, student-centred learning environment in Saidabad, Prayagraj.' },
    { src: '/assets/hero-community.png', fallback: galleryFallback[1].fallback, eyebrow: 'GROW WITH CONFIDENCE', title: 'Curiosity in class. Character for life.', text: 'A school experience shaped by learning, values, and the confidence to try something new.' },
  ];

  useEffect(() => {
    api.get('/gallery').then(({ data }) => {
      if (Array.isArray(data?.data) && data.data.length) {
        setGalleryItems(data.data.slice(0, 4).map((item) => ({ ...item, fallback: undefined })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeSlide];
  return (
    <>
      <section className="hero-section">
        <div className="hero-media"><AssetImage src={slide.src} fallback={slide.fallback} alt="P.N. Central Academy campus" className="hero-media-image" loading="eager" /></div>
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="hero-text" key={activeSlide}>
            <p className="eyebrow eyebrow-light"><span /> {slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <p className="hero-copy">{slide.text}</p>
            <div className="hero-actions">
              <Link className="button button-gold" to="/admissions">Explore admissions <ArrowUpRight size={17} /></Link>
              <Link className="button button-outline-light" to="/about">Discover our school <ArrowRight size={16} /></Link>
            </div>
            <div className="hero-microcopy"><CheckCircle2 size={16} /><span>Learning, discipline and all-round development</span></div>
          </div>
          <div className="hero-card">
            <div className="hero-card-icon"><GraduationCap size={23} /></div>
            <p className="hero-card-label">WELCOME TO</p>
            <h2>{settings.schoolName || school.name}</h2>
            <p>Helping every learner build the habits, knowledge and confidence to move forward.</p>
            <Link to="/vision" className="hero-card-link">Our values <ArrowUpRight size={15} /></Link>
          </div>
          <div className="hero-controls" aria-label="Hero slides">
            <span>0{activeSlide + 1} <i /> 0{slides.length}</span>
            {slides.map((item, index) => <button key={item.title} aria-label={`Show slide ${index + 1}`} className={activeSlide === index ? 'hero-dot active' : 'hero-dot'} onClick={() => setActiveSlide(index)} />)}
          </div>
          <div className="hero-location"><MapPin size={15} /> Saidabad · Prayagraj, Uttar Pradesh</div>
        </div>
        <div className="hero-bottom-wash" />
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><span className="trust-number">01</span><div><strong>Student-centred</strong><small>Learning with care</small></div></div>
          <div><span className="trust-number">02</span><div><strong>Values-led</strong><small>Discipline & character</small></div></div>
          <div><span className="trust-number">03</span><div><strong>Holistic growth</strong><small>Beyond textbooks</small></div></div>
          <div><span className="trust-number">04</span><div><strong>Future-ready</strong><small>Curiosity & confidence</small></div></div>
        </div>
      </section>

      <section className="affiliation-strip" aria-label="School affiliation">
        <div className="container affiliation-strip-inner">
          <span className="affiliation-seal"><ShieldCheck size={23} /></span>
          <div><strong>CBSE Affiliated School</strong><span>Affiliation No. {school.affiliationNumber} <i>·</i> School Code {school.schoolCode}</span></div>
          <Link to="/mandatory-disclosure" className="affiliation-link">View school disclosure <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className="section section-about">
        <div className="container about-grid">
          <div className="about-visual-wrap">
            <div className="about-visual"><AssetImage src="/assets/campus-square-image.png" fallback={galleryFallback[0].fallback} alt="P.N. Central Academy school building" /></div>
            <div className="about-note"><span className="note-symbol">“</span><p>Discipline is our tradition. Leadership is our legacy.</p><span className="note-rule" /></div>
            <div className="about-visual-index">PNCA <span>·</span> PRAYAGRAJ</div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">ABOUT OUR SCHOOL</p>
            <h2 className="section-heading">{settings.introTitle || 'Education with purpose. Character for life.'}</h2>
            <p className="lead-paragraph">{settings.introText || aboutText}</p>
            <p className="body-copy">We believe that learning should help students build clear thinking, confidence, empathy and a strong sense of responsibility. Our aim is to support each learner through meaningful lessons and a balanced school experience.</p>
            <div className="about-checks">
              <div><CheckCircle2 size={18} /><span>Focus on strong foundations</span></div>
              <div><CheckCircle2 size={18} /><span>Encouragement to explore and ask questions</span></div>
              <div><CheckCircle2 size={18} /><span>Learning with values and responsibility</span></div>
            </div>
            <Link to="/about" className="text-link">More about the academy <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-header centered-header">
            <p className="eyebrow">THE LEARNING EXPERIENCE</p>
            <h2 className="section-heading">Room to discover. Support to grow.</h2>
            <p className="section-description">A good school journey combines strong classroom learning with opportunities to create, investigate, read and play.</p>
          </div>
          <div className="facility-grid">
            {facilities.map((item, index) => {
              const Icon = iconMap[item.icon] || Sparkles;
              const photo = facilityImages[item.icon];
              return <article className="facility-card facility-card--photo" key={item.title}>
                <div className="facility-image-wrap">
                  <AssetImage src={photo?.src || '/assets/campus-square-image.png'} alt={photo?.alt || `${item.title} at P.N. Central Academy`} className="facility-card-image" loading="lazy" />
                  <div className="facility-topline"><span>{String(index + 1).padStart(2, '0')}</span><span className="facility-icon"><Icon size={22} strokeWidth={1.7} /></span></div>
                </div>
                <div className="facility-card-content"><p className="facility-category">{item.category}</p><h3>{item.title}</h3><p>{item.text}</p><Link to="/infrastructure" aria-label={`Explore ${item.title}`} className="circle-arrow"><ArrowUpRight size={17} /></Link></div>
              </article>;
            })}
          </div>
          <div className="center-actions"><Link className="button button-navy" to="/infrastructure">Explore facilities <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      <section className="section section-values">
        <div className="container values-grid">
          <div className="values-intro">
            <p className="eyebrow eyebrow-light">OUR APPROACH</p>
            <h2 className="section-heading">Good education goes beyond a report card.</h2>
            <p>We want students to develop the knowledge and the personal qualities to make thoughtful choices, work with others and keep learning as the world changes.</p>
            <Link to="/vision" className="button button-outline-light">Vision & mission <ArrowUpRight size={16} /></Link>
          </div>
          <div className="value-list">
            <article><span className="value-icon"><BookMarked size={22} /></span><div><h3>Academic foundations</h3><p>Build understanding, study habits and the confidence to ask questions.</p></div><span className="value-index">01</span></article>
            <article><span className="value-icon"><HeartHandshake size={22} /></span><div><h3>Character & care</h3><p>Practise respect, responsibility, honesty and empathy in everyday school life.</p></div><span className="value-index">02</span></article>
            <article><span className="value-icon"><Leaf size={22} /></span><div><h3>Whole-child growth</h3><p>Make room for creativity, physical activity and social confidence.</p></div><span className="value-index">03</span></article>
            <article><span className="value-icon"><ShieldCheck size={22} /></span><div><h3>Prepared for tomorrow</h3><p>Encourage curiosity, adaptability and a willingness to keep improving.</p></div><span className="value-index">04</span></article>
          </div>
        </div>
      </section>

      <section className="section leadership-section">
        <div className="container">
          <div className="section-header leadership-heading"><div><p className="eyebrow">A MESSAGE FROM OUR LEADERSHIP</p><h2 className="section-heading">Learning starts with trust.</h2></div><Link to="/about" className="text-link">Meet the academy <ArrowUpRight size={16} /></Link></div>
          <div className="leadership-grid">
            <article className="message-card director-card">
              <div className="leader-photo"><AssetImage src="/assets/director.png" fallback="#" alt="Mr. Santosh Tiwari, Director" /></div>
              <div className="message-content"><Quote size={25} className="quote-icon" /><p>{directorMessage}</p><div className="leader-attribution"><strong>{school.director}</strong><span>Director</span></div></div>
            </article>
            <article className="message-card principal-card">
              <div className="leader-photo leader-placeholder"><AssetImage src="/assets/principal.png" fallback="#" alt="Dr. Neeta Mishra, Principal" /></div>
              <div className="message-content"><Quote size={25} className="quote-icon" /><p>{principalMessage}</p><div className="leader-attribution"><strong>{school.principal}</strong><span>Principal</span></div></div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-gallery section-light">
        <div className="container">
          <div className="section-header gallery-heading"><div><p className="eyebrow">A GLIMPSE OF SCHOOL LIFE</p><h2 className="section-heading">Moments that make memories.</h2></div><Link to="/gallery" className="text-link">View photo gallery <ArrowUpRight size={16} /></Link></div>
          <div className="mini-gallery-grid">
            {galleryItems.map((item, index) => <Link to="/gallery" key={item._id || item.title + index} className={`mini-gallery-item mini-gallery-item-${index + 1}`}>
              <AssetImage src={item.imageUrl || item.src} fallback={item.fallback} alt={item.title || 'School gallery image'} />
              <span className="mini-gallery-label"><span>{item.category || 'School life'}</span><strong>{item.title || 'P.N. Central Academy'}</strong></span>
              <span className="mini-gallery-arrow"><ArrowUpRight size={18} /></span>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="admission-cta-section">
        <div className="container admission-cta-grid">
          <div><p className="eyebrow eyebrow-light">TAKE THE NEXT STEP</p><h2>Start the conversation about your child’s learning journey.</h2><p>Ask the school office about admission eligibility, availability, documents and the current fee schedule.</p><div className="cta-contact-line"><PhoneIcon /> <span>{settings.phonePrimary} <i>·</i> {settings.phoneSecondary}</span></div></div>
          <div className="cta-panel"><EnquiryForm compact /></div>
        </div>
      </section>

      <section className="section contact-strip-section">
        <div className="container contact-strip"><div className="contact-strip-icon"><MapPin size={24} /></div><div><p className="eyebrow">COME SAY HELLO</p><h2>Find us in Saidabad, Prayagraj.</h2><p>{settings.address || school.address}</p></div><a className="button button-navy" href={school.mapUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={17} /></a></div>
      </section>
    </>
  );
}

function PhoneIcon() { return <span className="phone-icon-symbol">↗</span>; }
