import { ArrowUpRight, BookOpenCheck, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { school } from '../data/site';

export default function History() {
  return <>
    <PageHero title="A story shaped by learning and values." crumb="School history" description="A history page should reflect the academy’s verified milestones, not an assumed founding timeline." />
    <section className="section"><div className="container history-grid">
      <div className="history-symbol"><BookOpenCheck size={52} strokeWidth={1.35}/><span>OUR STORY<br/>OUR PURPOSE</span></div>
      <div><p className="eyebrow">THE ACADEMY</p><h2 className="section-heading">A clear story begins with verified facts.</h2><p className="lead-paragraph">P.N. Central Academy is based in Mauadih, Saidabad, Uttar Pradesh. Its public website describes an English-medium, co-educational school following the CBSE curriculum and emphasises academic learning, discipline and holistic development.</p><p className="body-copy">The source website currently advertises more than ten years of experience but does not provide a dated founding timeline in the publicly visible text reviewed for this redesign. We have therefore not invented a founding year or milestone dates.</p><div className="review-note"><strong>School review needed</strong><p>Before launch, the school should supply the establishment year, recognition milestones, important campus developments, and any historical photographs cleared for publication.</p></div><div className="history-contact-row"><CalendarClock size={19}/><span>For the official school history, contact the office at <a href={`tel:${school.phonePrimary}`}>{school.phonePrimary}</a>.</span></div><Link to="/contact" className="button button-primary">Contact the school <ArrowUpRight size={16}/></Link></div>
    </div></section>
  </>;
}
