import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpRight, BadgeCheck, ClipboardList, FileCheck2, GraduationCap, MessageCircle, PhoneCall } from 'lucide-react';
import PageHero from '../components/PageHero';
import EnquiryForm from '../components/EnquiryForm';
import { school } from '../data/site';
import { getWhatsAppUrl } from '../lib/contactLinks';
import { useSite } from '../components/SiteContext';

const steps = [
  { icon: MessageCircle, title: 'Talk to the school', text: 'Contact the office to confirm entry classes, current seat availability, age criteria and the admission calendar.' },
  { icon: ClipboardList, title: 'Understand the process', text: 'Ask which application form and supporting documents are required for your child’s class.' },
  { icon: FileCheck2, title: 'Submit documents', text: 'Submit the current form and the documents requested by the school office. Keep copies for your records.' },
  { icon: BadgeCheck, title: 'Confirm next steps', text: 'The school will guide families about any interaction, assessment, fee payment and joining formalities that apply.' },
];

export default function Admissions() {
  const { settings } = useSite();
  const [showDocNote, setShowDocNote] = useState(false);
  const whatsappUrl = getWhatsAppUrl(settings.phoneWhatsapp || settings.phonePrimary, 'Hello P.N. Central Academy, I would like to ask about admissions.');
  return <>
    <PageHero title="Every school journey starts with a conversation." crumb="Admissions" description="Find the right information before applying to P.N. Central Academy." />
    <section className="section"><div className="container admissions-intro-grid"><div><p className="eyebrow">ADMISSION PROCESS</p><h2 className="section-heading">Clear steps for families.</h2><p className="lead-paragraph">A simple enquiry is the best place to begin. The process below is a parent-friendly guide; the school office should confirm current eligibility, deadlines, required documents and any assessments.</p><div className="admission-steps">{steps.map((step, index) => { const Icon = step.icon; return <article className="admission-step" key={step.title}><div className="step-icon"><Icon size={21}/></div><div><span>STEP 0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></div></article>; })}</div><button className="inline-disclosure-toggle" onClick={() => setShowDocNote((value) => !value)} aria-expanded={showDocNote}><ArrowDownToLine size={17}/> Application form & prospectus <span>{showDocNote ? 'Hide details' : 'Document details'}</span></button>{showDocNote && <div className="review-note"><strong>Current admission documents</strong><p>Open the school’s admission resources page for the latest prospectus, application form, fee information, and other PDFs that the administrator has published.</p><Link to="/admission-resources">View prospectus & application forms <ArrowUpRight size={14}/></Link></div>}</div><aside className="admissions-side-card"><div className="admission-side-icon"><GraduationCap size={28}/></div><p className="eyebrow">START HERE</p><h3>Need help with the process?</h3><p>Share your contact details and the class you are enquiring about. The office can guide you on the next steps.</p><div className="admission-side-contact"><PhoneCall size={18}/><div><small>Call the school</small><a href={`tel:${settings.phonePrimary}`}>{settings.phonePrimary}</a><a href={`tel:${settings.phoneSecondary}`}>{settings.phoneSecondary}</a></div></div><div className="admission-side-contact"><MessageCircle size={18}/><div><small>Email the office</small><a href={`mailto:${settings.email}`}>{settings.email}</a></div></div>{whatsappUrl && <div className="admission-side-contact"><MessageCircle size={18}/><div><small>WhatsApp the office</small><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Start a WhatsApp chat</a></div></div>}<div className="admission-resources-quick-link"><Link to="/admission-resources">View admission forms & prospectus <ArrowUpRight size={15}/></Link><Link to="/notices">Read school notices <ArrowUpRight size={15}/></Link></div><p className="admission-open-status">{settings.admissionsOpen ? 'Enquiries welcome' : 'Please call to check admissions'}</p></aside></div></section>
    <section className="section section-light"><div className="container enquiry-page-grid"><div><p className="eyebrow">ENQUIRY FORM</p><h2 className="section-heading">Tell us what you’re looking for.</h2><p className="lead-paragraph">Submitting this form sends an enquiry to the website database so the authorised school administrator can review it. Please do not enter sensitive personal or medical details.</p><p className="body-copy">The form is not an admission confirmation. All eligibility, availability, dates and fee details are subject to the school’s confirmation.</p></div><div className="enquiry-page-form"><EnquiryForm/></div></div></section>
  </>;
}
