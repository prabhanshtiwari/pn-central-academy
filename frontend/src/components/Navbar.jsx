// import { useEffect, useRef, useState } from 'react';
// import { Link, NavLink } from 'react-router-dom';
// import { Menu, X, Phone, Mail, ChevronDown, ArrowUpRight, MessageCircle } from 'lucide-react';
// import { pageLinks } from '../data/site';
// import { useSite } from './SiteContext';
// import { getWhatsAppUrl } from '../lib/contactLinks';

// const primaryLabels = ['Home', 'About', 'Admissions', 'Gallery', 'Notices', 'Contact'];
// const megaGroups = [
//   { title: 'Our school', subtitle: 'Learn about the academy', labels: ['History', 'Vision & Mission', 'Facilities', 'Staff'] },
//   { title: 'Admissions', subtitle: 'Plan the next step', labels: ['Admission Resources', 'Fee Structure', 'Disclosure'] },
//   { title: 'Student life', subtitle: 'Explore beyond the classroom', labels: ['Student Corner', 'Videos'] },
// ];

// export default function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [megaOpen, setMegaOpen] = useState(false);
//   const navRef = useRef(null);
//   const { settings } = useSite();
//   const mainLinks = pageLinks.filter((link) => primaryLabels.includes(link.label));
//   const whatsappUrl = getWhatsAppUrl(settings.phoneWhatsapp || settings.phonePrimary, 'Hello P.N. Central Academy, I would like to enquire about admissions.');

//   function closeMenu() {
//     setMenuOpen(false);
//     setMegaOpen(false);
//   }

//   useEffect(() => {
//     function closeOnOutsideClick(event) {
//       if (navRef.current && !navRef.current.contains(event.target)) setMegaOpen(false);
//     }
//     function closeOnEscape(event) {
//       if (event.key === 'Escape') closeMenu();
//     }
//     document.addEventListener('pointerdown', closeOnOutsideClick);
//     document.addEventListener('keydown', closeOnEscape);
//     return () => {
//       document.removeEventListener('pointerdown', closeOnOutsideClick);
//       document.removeEventListener('keydown', closeOnEscape);
//     };
//   }, []);

//   return <>
//     <div className="topline">
//       <div className="container topline-inner">
//         <span className="topline-note">CBSE-affiliated learning · Saidabad, Prayagraj</span>
//         <div className="topline-contact">
//           {settings.phonePrimary && <a href={`tel:${settings.phonePrimary}`}><Phone size={13} aria-hidden="true" /> {settings.phonePrimary}</a>}
//           {settings.email && <a href={`mailto:${settings.email}`}><Mail size={13} aria-hidden="true" /> {settings.email}</a>}
//           {whatsappUrl && <a className="topline-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={13} aria-hidden="true" /> WhatsApp</a>}
//         </div>
//       </div>
//     </div>
//     <header className="site-header" ref={navRef}>
//       <div className="container nav-inner">
//         <Link to="/" className="brand" aria-label="P.N. Central Academy home" onClick={closeMenu}>
//           <span className="brand-mark"><img src="/assets/pn-central-academy-logo.png" alt="P.N. Central Academy logo" /></span>
//           <span className="brand-copy"><strong>P.N. CENTRAL</strong><small>ACADEMY · PRAYAGRAJ</small></span>
//         </Link>

//         <button className="mobile-nav-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
//           {menuOpen ? <X size={23} /> : <Menu size={23} />}
//         </button>

//         <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
//           {mainLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={closeMenu} end={link.to === '/'}>{link.label}</NavLink>)}

//           <div className={`nav-mega ${megaOpen ? 'nav-mega-open' : ''}`}>
//             <button className="nav-mega-trigger" type="button" aria-expanded={megaOpen} onClick={() => setMegaOpen((value) => !value)}>
//               Explore <ChevronDown size={15} aria-hidden="true" />
//             </button>
//             <div className="nav-mega-panel" hidden={!megaOpen}>
//               <div className="nav-mega-intro">
//                 <span className="nav-mega-kicker">P.N. CENTRAL ACADEMY</span>
//                 <strong>Everything you need to know</strong>
//                 <p>Explore school information, resources and student life.</p>
//                 <Link to="/admissions" className="nav-mega-feature-link" onClick={closeMenu}>Start an admission enquiry <ArrowUpRight size={15} /></Link>
//               </div>
//               {megaGroups.map((group) => <div className="nav-mega-group" key={group.title}>
//                 <span className="nav-mega-group-title">{group.title}</span>
//                 <small>{group.subtitle}</small>
//                 {group.labels.map((label) => {
//                   const link = pageLinks.find((item) => item.label === label);
//                   return link ? <NavLink key={link.to} to={link.to} onClick={closeMenu}>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></NavLink> : null;
//                 })}
//               </div>)}
//             </div>
//           </div>

//           <Link to="/admissions" className="nav-cta" onClick={closeMenu}>Enquire now <ArrowUpRight size={15} aria-hidden="true" /></Link>
//         </nav>
//       </div>
//     </header>
//   </>;
// }



import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  Mail,
  ChevronDown,
  ArrowUpRight,
  MessageCircle,
  GraduationCap,
  MapPin,
} from 'lucide-react';

import { pageLinks } from '../data/site';
import { useSite } from './SiteContext';
import { getWhatsAppUrl } from '../lib/contactLinks';

const primaryLabels = [
  'Home',
  'About',
  'Admissions',
  'Gallery',
  'Notices',
  'Contact',
];

const megaGroups = [
  {
    title: 'Our school',
    subtitle: 'Learn about the academy',
    labels: ['History', 'Vision & Mission', 'Facilities', 'Staff'],
  },
  {
    title: 'Admissions',
    subtitle: 'Plan the next step',
    labels: ['Admission Resources', 'Fee Structure', 'Disclosure'],
  },
  {
    title: 'Student life',
    subtitle: 'Explore beyond the classroom',
    labels: ['Student Corner', 'Videos'],
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const navRef = useRef(null);
  const exploreRef = useRef(null);

  const { settings } = useSite();

  const mainLinks = pageLinks.filter((link) =>
    primaryLabels.includes(link.label)
  );

  const whatsappUrl = getWhatsAppUrl(
    settings.phoneWhatsapp || settings.phonePrimary,
    'Hello P.N. Central Academy, I would like to enquire about admissions.'
  );

  function closeMenu() {
    setMenuOpen(false);
    setMegaOpen(false);
  }

  function toggleExplore() {
    setMegaOpen((previous) => !previous);
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        exploreRef.current &&
        !exploreRef.current.contains(event.target)
      ) {
        setMegaOpen(false);
      }

      if (
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }

    function handleResize() {
      if (window.innerWidth > 1050) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* TOP CONTACT BAR */}
      <div className="school-topbar">
        <div className="school-topbar-inner">
          <div className="school-topbar-location">
            <MapPin size={14} aria-hidden="true" />

            <span>
              CBSE-affiliated learning · Saidabad, Prayagraj
            </span>
          </div>

          <div className="school-topbar-contact">
            {settings.phonePrimary && (
              <a href={`tel:${settings.phonePrimary}`}>
                <Phone size={14} aria-hidden="true" />
                <span>{settings.phonePrimary}</span>
              </a>
            )}

            {settings.email && (
              <a href={`mailto:${settings.email}`}>
                <Mail size={14} aria-hidden="true" />
                <span>{settings.email}</span>
              </a>
            )}

            {whatsappUrl && (
              <a
                className="school-topbar-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={14} aria-hidden="true" />
                <span>WhatsApp</span>
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <header className="school-header" ref={navRef}>
        <div className="school-header-inner">
          {/* BRAND */}
          <Link
            to="/"
            className="school-brand"
            aria-label="P.N. Central Academy home"
            onClick={closeMenu}
          >
            <span className="school-brand-logo">
              <img
                src="/assets/pn-central-academy-logo.png"
                alt="P.N. Central Academy logo"
              />
            </span>

            <span className="school-brand-copy">
              <strong>P.N. CENTRAL</strong>
              <span className="school-brand-name">ACADEMY</span>
              <span className="school-brand-location">
                PRAYAGRAJ
              </span>
            </span>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            className="school-mobile-toggle"
            type="button"
            aria-label={
              menuOpen ? 'Close navigation' : 'Open navigation'
            }
            aria-expanded={menuOpen}
            aria-controls="school-primary-navigation"
            onClick={() => {
              setMenuOpen((previous) => !previous);
              setMegaOpen(false);
            }}
          >
            {menuOpen ? (
              <X size={23} strokeWidth={2} />
            ) : (
              <Menu size={23} strokeWidth={2} />
            )}
          </button>

          {/* NAVIGATION LINKS */}
          <nav
            id="school-primary-navigation"
            className={`school-navigation ${
              menuOpen ? 'school-navigation-open' : ''
            }`}
            aria-label="Main navigation"
          >
            <div className="school-navigation-links">
              {mainLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `school-nav-link ${
                      isActive ? 'school-nav-link-active' : ''
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* EXPLORE MENU */}
              <div
                className={`school-explore ${
                  megaOpen ? 'school-explore-open' : ''
                }`}
                ref={exploreRef}
              >
                <button
                  className="school-nav-link school-explore-trigger"
                  type="button"
                  aria-expanded={megaOpen}
                  aria-controls="school-explore-panel"
                  onClick={toggleExplore}
                >
                  Explore

                  <ChevronDown
                    size={15}
                    className="school-explore-chevron"
                    aria-hidden="true"
                  />
                </button>

                <div
                  id="school-explore-panel"
                  className="school-explore-panel"
                  hidden={!megaOpen}
                >
                  <div className="school-explore-heading">
                    <span className="school-explore-icon">
                      <GraduationCap
                        size={27}
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <span className="school-eyebrow">
                        P.N. CENTRAL ACADEMY
                      </span>

                      <h2>Explore our academy</h2>

                      <p>
                        Everything you need to know about our school,
                        admissions and student life.
                      </p>
                    </div>
                  </div>

                  <div className="school-explore-groups">
                    {megaGroups.map((group) => (
                      <div
                        className="school-explore-group"
                        key={group.title}
                      >
                        <h3>{group.title}</h3>

                        <p>{group.subtitle}</p>

                        <div className="school-explore-group-links">
                          {group.labels.map((label) => {
                            const link = pageLinks.find(
                              (item) => item.label === label
                            );

                            if (!link) return null;

                            return (
                              <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={closeMenu}
                                className="school-explore-item"
                              >
                                <span>{link.label}</span>

                                <ArrowUpRight
                                  size={14}
                                  aria-hidden="true"
                                />
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/admissions"
                    className="school-explore-footer"
                    onClick={closeMenu}
                  >
                    <span>
                      <strong>Planning an admission?</strong>
                      <small>
                        Explore the next steps for your child.
                      </small>
                    </span>

                    <span className="school-explore-footer-action">
                      Get started
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ADMISSION CTA */}
            <Link
              to="/admissions"
              className="school-admission-button"
              onClick={closeMenu}
            >
              <span>Enquire now</span>

              <ArrowUpRight
                size={16}
                aria-hidden="true"
              />
            </Link>

            {/* MOBILE CONTACT INFORMATION */}
            <div className="school-mobile-contact">
              {settings.phonePrimary && (
                <a href={`tel:${settings.phonePrimary}`}>
                  <Phone size={16} aria-hidden="true" />
                  <span>Call the school</span>
                </a>
              )}

              {settings.email && (
                <a href={`mailto:${settings.email}`}>
                  <Mail size={16} aria-hidden="true" />
                  <span>Email the school</span>
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
