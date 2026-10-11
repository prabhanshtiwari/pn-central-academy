import { ArrowUpRight, CalendarDays, ClipboardList, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { school } from '../data/site';

const resources = [
  { title: 'Time table', label: 'Student resource', icon: CalendarDays, text: 'A current class-wise timetable was not available as a downloadable document on the publicly visible source page reviewed for this redesign.' },
  { title: 'Academic calendar', label: 'Student resource', icon: ClipboardList, text: 'The school should provide the approved current-session calendar, including term dates, holidays, assessments and events.' },
  { title: 'Notices & documents', label: 'School updates', icon: FileText, text: 'Official notices and student documents should be published here once the school provides current, approved files.' },
];

export default function StudentCorner() {
  return <>
    <PageHero title="Resources for students and families." crumb="Student corner" description="Find school documents and schedules. Only verified, current documents should be published." />
    <section className="section"><div className="container"><div className="section-header"><p className="eyebrow">STUDENT CORNER</p><h2 className="section-heading">Useful information, all in one place.</h2><p className="section-description">The original website lists timetable and academic-calendar links, but the linked current documents could not be confirmed during this review. The resources below are marked honestly until the school supplies the files.</p></div><div className="student-resource-grid">{resources.map((item) => { const Icon = item.icon; return <article className="student-resource-card" key={item.title}><span className="student-resource-icon"><Icon size={25}/></span><small>{item.label}</small><h3>{item.title}</h3><p>{item.text}</p><span className="resource-pending">Awaiting school document</span></article>; })}</div><div className="review-note"><strong>School administrators</strong><p>Upload the approved timetable, academic calendar and notices in accessible PDF format, with clear session dates. Avoid publishing student-specific personal data.</p></div><Link to="/contact" className="button button-primary">Ask the school office <ArrowUpRight size={16}/></Link><p className="history-contact-row">You can also call <a href={`tel:${school.phonePrimary}`}>{school.phonePrimary}</a> or email <a href={`mailto:${school.email}`}>{school.email}</a>.</p></div></section>
  </>;
}
