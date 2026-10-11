import { ArrowUpRight, Compass, Heart, Lightbulb, ShieldCheck, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

const pillars = [
  { icon: Lightbulb, title: 'Academic excellence', body: 'Build understanding, curiosity and thoughtful problem-solving through strong foundations.' },
  { icon: ShieldCheck, title: 'Character building', body: 'Practise integrity, discipline, respect and responsibility in daily school life.' },
  { icon: Compass, title: 'Skill development', body: 'Help learners develop communication, creativity, independent thinking and adaptability.' },
  { icon: Heart, title: 'Holistic growth', body: 'Support intellectual, emotional, social and physical development beyond examinations.' },
];

export default function Vision() {
  return <>
    <PageHero title="Learn with curiosity. Lead with character." crumb="Vision & mission" description="The values and direction that shape the academy’s approach to education." />
    <section className="section"><div className="container vision-lead-grid"><div className="vision-mark"><Compass size={55} strokeWidth={1.3}/><span>OUR<br/>DIRECTION</span></div><div><p className="eyebrow">OUR VISION</p><h2 className="section-heading">A confident learner. A responsible citizen.</h2><p className="lead-paragraph">To create an educational environment where students learn with curiosity, grow with confidence and succeed with strong moral values.</p><p className="body-copy">The school’s published vision calls for high standards in academics, discipline, co-curricular activities and personality development, while integrating technology with learning and staying grounded in traditional values.</p></div></div></section>
    <section className="section section-light"><div className="container"><div className="section-header centered-header"><p className="eyebrow">OUR MISSION IN ACTION</p><h2 className="section-heading">Four commitments that matter.</h2><p className="section-description">A school’s mission becomes meaningful when students see it in everyday learning and relationships.</p></div><div className="pillars-grid">{pillars.map((item, index) => { const Icon = item.icon; return <article className="pillar-card" key={item.title}><div className="pillar-number">0{index + 1}</div><Icon size={27} strokeWidth={1.6}/><h3>{item.title}</h3><p>{item.body}</p></article>; })}</div></div></section>
    <section className="vision-bottom"><div className="container vision-bottom-inner"><div><Target size={30}/><h2>Education should open doors.</h2><p>Help your child explore an environment built around learning, values and personal growth.</p></div><Link to="/admissions" className="button button-gold">Enquire about admission <ArrowUpRight size={17}/></Link></div></section>
  </>;
}
