import { useEffect, useState } from 'react';
import { ArrowDownToLine, FileText, GraduationCap, RefreshCw } from 'lucide-react';
import PageHero from '../components/PageHero';
import api, { getErrorMessage, getMediaUrl } from '../lib/api';

const categoryLabels = {
  prospectus: 'Prospectus',
  'admission-form': 'Admission form',
  'fee-structure': 'Fee structure',
  'required-documents': 'Required documents',
  other: 'School information',
};

export default function AdmissionResources() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  async function load() {
    setState({ loading: true, error: '' });
    try {
      const { data } = await api.get('/admission-documents');
      setItems(Array.isArray(data?.data) ? data.data : []);
      setState({ loading: false, error: '' });
    } catch (error) { setState({ loading: false, error: getErrorMessage(error) }); }
  }
  useEffect(() => { load(); }, []);

  return <>
    <PageHero title="Admission forms & resources" crumb="Admission resources" description="Download the latest prospectus, application forms, fee documents and other information published by P.N. Central Academy." />
    <section className="section section-light"><div className="container admission-resources-wrap">
      <div className="admission-resources-intro"><span className="notice-page-icon"><GraduationCap size={26}/></span><div><p className="eyebrow">ADMISSION DESK</p><h2 className="section-heading">Documents for families.</h2><p className="body-copy">Use only the latest documents published by the school. Contact the office if you need help or cannot open a file.</p></div></div>
      {state.loading ? <div className="public-loading"><RefreshCw size={21} className="spin"/> Loading admission resources…</div> : state.error ? <div className="public-empty-state"><p>{state.error}</p><button className="button button-outline-dark" onClick={load}>Try again <RefreshCw size={15}/></button></div> : items.length ? <div className="admission-resource-grid">{items.map((item) => <article className="admission-resource-card" key={item._id}>
        <span className="admission-resource-icon"><FileText size={24}/></span><p className="facility-category">{categoryLabels[item.category] || 'School information'}</p><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<a className="button button-navy" href={getMediaUrl(item.fileUrl)} target="_blank" rel="noopener noreferrer">Open PDF <ArrowDownToLine size={16}/></a>
      </article>)}</div> : <div className="public-empty-state"><span><FileText size={26}/></span><h3>No documents published yet</h3><p>The school office will publish the current prospectus and admission forms here when they are available.</p></div>}
    </div></section>
  </>;
}
