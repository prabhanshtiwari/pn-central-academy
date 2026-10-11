import { ArrowUpRight, ClipboardCheck, FileText } from 'lucide-react';
import PageHero from '../components/PageHero';
import { school } from '../data/site';

const rows = [
  ['Name of the school', school.name],
  ['Affiliation number', school.affiliationNumber],
  ['School code', school.schoolCode],
  ['Complete address', school.address],
  ['Principal name', school.principal],
  ['Principal qualification', 'B.Ed., M.Ed., C-TET (as stated on the public source page; verify before official use)'],
  ['School email', school.email],
  ['Contact numbers', `${school.phonePrimary}, ${school.phoneSecondary}`],
];

export default function Disclosure() {
  return <>
    <PageHero title="School information & public disclosure." crumb="Mandatory disclosure" description="Key details transcribed from the current publicly visible school disclosure page." />
    <section className="section"><div className="container disclosure-content"><div className="disclosure-intro"><span className="disclosure-icon"><ClipboardCheck size={25}/></span><div><p className="eyebrow">GENERAL INFORMATION</p><h2 className="section-heading">Public school details.</h2><p className="lead-paragraph">The following information appears on the school’s original disclosure page. The school should review it periodically and supply current signed documents.</p></div></div><div className="disclosure-table-wrap"><table className="disclosure-table"><thead><tr><th>Information</th><th>Published detail</th></tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div><div className="disclosure-documents"><div className="document-card"><span><FileText size={23}/></span><div><h3>School documents</h3><p>The original page lists two document rows, but the document names and links appear incomplete.</p></div><a href="https://www.pncentralacademy.com/mandisclosure.php" target="_blank" rel="noreferrer" aria-label="Open original disclosure page"><ArrowUpRight size={18}/></a></div><div className="review-note"><strong>Publication review required</strong><p>Before launch, verify the affiliation number, school code, principal qualification, contact details, and upload the current mandatory documents in readable PDF format. This page must not be treated as an official certification until the school approves it.</p></div></div></div></section>
  </>;
}
