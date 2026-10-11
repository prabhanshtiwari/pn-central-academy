import { ArrowUpRight, BadgeIndianRupee, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { school } from '../data/site';

export default function Fees() {
  return <>
    <PageHero title="Fee information, without guesswork." crumb="Fee structure" description="Get the current approved fee schedule directly from the school office." />
    <section className="section"><div className="container fee-content-grid"><div className="fee-icon-panel"><BadgeIndianRupee size={58} strokeWidth={1.25}/><span>IMPORTANT</span><strong>Current session</strong><p>Fee amounts can change by class and session. Confirm the latest schedule with the school.</p></div><div><p className="eyebrow">FEE STRUCTURE</p><h2 className="section-heading">Ask for the latest fee document.</h2><p className="lead-paragraph">The source website lists a downloadable fee-structure document, but the actual fee amounts were not reliably available as readable page content during this review. No amounts are shown here to avoid publishing unverified figures.</p><p className="body-copy">Before admission, ask the office to explain the one-time charges, recurring tuition, transport (if applicable), any other required fees, payment schedule and refund policy.</p><div className="fee-actions"><a className="button button-primary" href="https://www.pncentralacademy.com/fees-structure.php" target="_blank" rel="noreferrer">View original fee page <ArrowUpRight size={17}/></a><a className="button button-outline-dark" href={`tel:${school.phonePrimary}`}><PhoneCall size={17}/> Call school office</a></div><div className="review-note"><strong>Before you pay</strong><p>Request the official current-session fee schedule and a school-issued receipt. Confirm payment details directly with authorised school staff.</p></div><Link to="/contact" className="text-link">Send a fee-related question <ArrowUpRight size={16}/></Link></div></div></section>
  </>;
}
