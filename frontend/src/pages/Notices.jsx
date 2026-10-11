import { useEffect, useState } from 'react';
import { CalendarDays, Download, FileText, Megaphone, RefreshCw } from 'lucide-react';
import PageHero from '../components/PageHero';
import api, { getErrorMessage, getMediaUrl } from '../lib/api';

export default function Notices() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  async function load() {
    setState({ loading: true, error: '' });
    try {
      const { data } = await api.get('/notices');
      setItems(Array.isArray(data?.data) ? data.data : []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: getErrorMessage(error) });
    }
  }

  useEffect(() => { load(); }, []);

  return <>
    <PageHero title="School notices & circulars" crumb="Notices" description="Read official school announcements, updates and circulars published by the authorised school office." />
    <section className="section section-light">
      <div className="container notice-page-wrap">
        <div className="notice-page-intro"><span className="notice-page-icon"><Megaphone size={25}/></span><div><p className="eyebrow">OFFICIAL UPDATES</p><h2 className="section-heading">The latest from the school office.</h2><p className="body-copy">Notices appear here on their publication date. If a notice includes a PDF, use the attachment link to open or download it.</p></div></div>
        {state.loading ? <div className="public-loading"><RefreshCw size={21} className="spin"/> Loading notices…</div> : state.error ? <div className="public-empty-state"><p>{state.error}</p><button className="button button-outline-dark" onClick={load}>Try again <RefreshCw size={15}/></button></div> : items.length ? <div className="public-notice-list">{items.map((item) => <article className="public-notice-card" key={item._id}>
          <div className="public-notice-date"><CalendarDays size={17}/><span>{new Date(item.publishDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
          <div className="public-notice-content"><h3>{item.title}</h3><p>{item.body}</p>{item.attachmentUrl && <a className="public-document-link" href={getMediaUrl(item.attachmentUrl)} target="_blank" rel="noopener noreferrer"><FileText size={17}/><span>{item.attachmentName || 'View notice attachment (PDF)'}</span><Download size={16}/></a>}</div>
        </article>)}</div> : <div className="public-empty-state"><span><FileText size={26}/></span><h3>No notices published right now</h3><p>Please check again later, or contact the school office for time-sensitive information.</p></div>}
      </div>
    </section>
  </>;
}
