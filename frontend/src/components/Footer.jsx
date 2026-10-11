import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowUpRight, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { pageLinks, school } from '../data/site';
import { useSite } from './SiteContext';
import { getWhatsAppUrl } from '../lib/contactLinks';

export default function Footer() {
  const year = new Date().getFullYear();
  const { settings } = useSite();
  const whatsappUrl = getWhatsAppUrl(settings.phoneWhatsapp || settings.phonePrimary, 'Hello P.N. Central Academy, I would like to enquire about admissions.');
  const exploreLinks = pageLinks.filter((link) => ['About', 'History', 'Vision & Mission', 'Facilities', 'Admissions', 'Admission Resources', 'Fee Structure', 'Student Corner', 'Notices', 'Gallery'].includes(link.label));

  return <footer className="site-footer">
    <div className="footer-top container">
      <div className="footer-about">
        <Link to="/" className="brand brand-footer" aria-label="P.N. Central Academy home">
          <span className="brand-mark"><img src="/assets/pn-central-academy-logo.png" alt="P.N. Central Academy logo" loading="lazy" /></span>
          <span className="brand-copy"><strong>P.N. CENTRAL</strong><small>ACADEMY · PRAYAGRAJ</small></span>
        </Link>
        <p>CBSE-affiliated learning with purpose, strong values, and opportunities to prepare students for a brighter future.</p>
        <div className="social-links" aria-label="Social links">
          <a href="https://www.facebook.com/profile.php?id=100064099479718" aria-label="P.N. Central Academy on Facebook" target="_blank" rel="noopener noreferrer"><Facebook size={17} aria-hidden="true" /></a>
          <a href="https://www.youtube.com/watch?v=WFFdzQhVcfg" aria-label="P.N. Central Academy on YouTube" target="_blank" rel="noopener noreferrer"><Youtube size={17} aria-hidden="true" /></a>
          {whatsappUrl && <a href={whatsappUrl} aria-label="Message P.N. Central Academy on WhatsApp" target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" /></a>}
        </div>
      </div>

      <div className="footer-col">
        <h3>Explore</h3>
        {exploreLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></Link>)}
      </div>

      <div className="footer-col footer-contact">
        <h3>Get in touch</h3>
        <p><MapPin size={17} aria-hidden="true" /><span>{settings.address || school.address}</span></p>
        <p><Phone size={17} aria-hidden="true" /><span>{settings.phonePrimary && <a href={`tel:${settings.phonePrimary}`}>{settings.phonePrimary}</a>}{settings.phonePrimary && settings.phoneSecondary && <br />}{settings.phoneSecondary && <a href={`tel:${settings.phoneSecondary}`}>{settings.phoneSecondary}</a>}</span></p>
        {settings.email && <p><Mail size={17} aria-hidden="true" /><a href={`mailto:${settings.email}`}>{settings.email}</a></p>}
        {whatsappUrl && <a className="footer-whatsapp-link" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> Chat with us on WhatsApp <ArrowUpRight size={13} aria-hidden="true" /></a>}
      </div>
    </div>

    <div className="footer-bottom"><div className="container footer-bottom-inner">
      <span>© {year} {settings.schoolName || school.name}. All rights reserved.</span>
      <span className="footer-bottom-links"><Link to="/mandatory-disclosure">School disclosure</Link><Link to="/contact">Contact</Link><Link to="/admin">Admin</Link></span>
    </div></div>
  </footer>;
}
