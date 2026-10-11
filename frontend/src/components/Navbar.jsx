import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, Mail, ChevronDown, ArrowUpRight, MessageCircle } from 'lucide-react';
import { pageLinks } from '../data/site';
import { useSite } from './SiteContext';
import { getWhatsAppUrl } from '../lib/contactLinks';

const primaryLabels = ['Home', 'About', 'Admissions', 'Gallery', 'Notices', 'Contact'];
const megaGroups = [
  { title: 'Our school', subtitle: 'Learn about the academy', labels: ['History', 'Vision & Mission', 'Facilities', 'Staff'] },
  { title: 'Admissions', subtitle: 'Plan the next step', labels: ['Admission Resources', 'Fee Structure', 'Disclosure'] },
  { title: 'Student life', subtitle: 'Explore beyond the classroom', labels: ['Student Corner', 'Videos'] },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const navRef = useRef(null);
  const { settings } = useSite();
  const mainLinks = pageLinks.filter((link) => primaryLabels.includes(link.label));
  const whatsappUrl = getWhatsAppUrl(settings.phoneWhatsapp || settings.phonePrimary, 'Hello P.N. Central Academy, I would like to enquire about admissions.');

  function closeMenu() {
    setMenuOpen(false);
    setMegaOpen(false);
  }

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (navRef.current && !navRef.current.contains(event.target)) setMegaOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') closeMenu();
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return <>
    <div className="topline">
      <div className="container topline-inner">
        <span className="topline-note">CBSE-affiliated learning · Saidabad, Prayagraj</span>
        <div className="topline-contact">
          {settings.phonePrimary && <a href={`tel:${settings.phonePrimary}`}><Phone size={13} aria-hidden="true" /> {settings.phonePrimary}</a>}
          {settings.email && <a href={`mailto:${settings.email}`}><Mail size={13} aria-hidden="true" /> {settings.email}</a>}
          {whatsappUrl && <a className="topline-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={13} aria-hidden="true" /> WhatsApp</a>}
        </div>
      </div>
    </div>
    <header className="site-header" ref={navRef}>
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="P.N. Central Academy home" onClick={closeMenu}>
          <span className="brand-mark"><img src="/assets/pn-central-academy-logo.png" alt="P.N. Central Academy logo" /></span>
          <span className="brand-copy"><strong>P.N. CENTRAL</strong><small>ACADEMY · PRAYAGRAJ</small></span>
        </Link>

        <button className="mobile-nav-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          {mainLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={closeMenu} end={link.to === '/'}>{link.label}</NavLink>)}

          <div className={`nav-mega ${megaOpen ? 'nav-mega-open' : ''}`}>
            <button className="nav-mega-trigger" type="button" aria-expanded={megaOpen} onClick={() => setMegaOpen((value) => !value)}>
              Explore <ChevronDown size={15} aria-hidden="true" />
            </button>
            <div className="nav-mega-panel" hidden={!megaOpen}>
              <div className="nav-mega-intro">
                <span className="nav-mega-kicker">P.N. CENTRAL ACADEMY</span>
                <strong>Everything you need to know</strong>
                <p>Explore school information, resources and student life.</p>
                <Link to="/admissions" className="nav-mega-feature-link" onClick={closeMenu}>Start an admission enquiry <ArrowUpRight size={15} /></Link>
              </div>
              {megaGroups.map((group) => <div className="nav-mega-group" key={group.title}>
                <span className="nav-mega-group-title">{group.title}</span>
                <small>{group.subtitle}</small>
                {group.labels.map((label) => {
                  const link = pageLinks.find((item) => item.label === label);
                  return link ? <NavLink key={link.to} to={link.to} onClick={closeMenu}>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></NavLink> : null;
                })}
              </div>)}
            </div>
          </div>

          <Link to="/admissions" className="nav-cta" onClick={closeMenu}>Enquire now <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </nav>
      </div>
    </header>
  </>;
}
