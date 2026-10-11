import { ArrowUpRight, BookOpen, FlaskConical, Laptop, Monitor, Music2, Trophy, Wifi, Microscope, Palette, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { facilities } from '../data/site';

const icons = { Monitor, FlaskConical, Laptop, BookOpen, Music2, Trophy };
const moreFacilities = [
  { title: 'Learning resources', description: 'Classroom resources can help teachers explain concepts through demonstration, discussion and practice.', icon: Wifi },
  { title: 'Hands-on activities', description: 'Experiments and practical projects help connect lesson concepts with observation and discovery.', icon: Microscope },
  { title: 'Arts & expression', description: 'Music, art and craft can make room for imagination, practice and creative confidence.', icon: Palette },
  { title: 'Student wellbeing', description: 'Families should confirm current health, first-aid, transport and safety procedures directly with the school.', icon: HeartPulse },
];

export default function Infrastructure() {
  return <>
    <PageHero title="Spaces that support discovery." crumb="School facilities" description="Explore the learning and enrichment facilities described on the school website." />
    <section className="section"><div className="container"><div className="section-header"><p className="eyebrow">CAMPUS & LEARNING</p><h2 className="section-heading">A balanced school experience.</h2><p className="section-description">Facilities below are described at a general level. Visit the campus or contact the office to confirm what is currently available and operational.</p></div><div className="facility-detail-grid">{facilities.map((item, index) => { const Icon = icons[item.icon]; return <article key={item.title} className="facility-detail-card"><div className="facility-detail-icon"><Icon size={26} strokeWidth={1.65}/></div><span className="facility-detail-index">FACILITY 0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p><span className="facility-detail-category">{item.category}</span></article>; })}</div></div></section>
    <section className="section section-light"><div className="container"><div className="section-header centered-header"><p className="eyebrow">BEYOND THE CLASSROOM</p><h2 className="section-heading">Learning has many forms.</h2></div><div className="support-grid">{moreFacilities.map((item) => { const Icon = item.icon; return <article className="support-card" key={item.title}><Icon size={24}/><div><h3>{item.title}</h3><p>{item.description}</p></div></article>; })}</div><div className="review-note"><strong>Information review note</strong><p>Some text on the source site’s infrastructure page appears to reference another location and should be verified by the school before republication. This redesign intentionally avoids presenting questionable medical or campus claims as confirmed facts.</p></div></div></section>
    <section className="vision-bottom"><div className="container vision-bottom-inner"><div><h2>Come see the learning environment.</h2><p>Contact the office to arrange a visit and ask questions about current facilities.</p></div><Link to="/contact" className="button button-gold">Contact the school <ArrowUpRight size={17}/></Link></div></section>
  </>;
}
