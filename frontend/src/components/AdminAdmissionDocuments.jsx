import { useEffect, useState } from 'react';
import { Download, Eye, EyeOff, FileText, LoaderCircle, Trash2, Upload } from 'lucide-react';
import api, { getErrorMessage, getMediaUrl } from '../lib/api';

const categories = [
  ['prospectus', 'School prospectus'],
  ['admission-form', 'Admission form'],
  ['fee-structure', 'Fee structure'],
  ['required-documents', 'Required documents'],
  ['other', 'Other admission information'],
];

export default function AdminAdmissionDocuments() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ kind: '', text: '' });
  const [form, setForm] = useState({ title: '', description: '', category: 'prospectus', isPublished: true, document: null });

  async function load() {
    const { data } = await api.get('/admin/admission-documents');
    setItems(data.data || []);
  }
  useEffect(() => { load().catch((error) => setMessage({ kind: 'error', text: getErrorMessage(error) })); }, []);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!form.document) { setMessage({ kind: 'error', text: 'Select a PDF file first.' }); return; }
    setBusy(true); setMessage({ kind: '', text: '' });
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('category', form.category);
      payload.append('isPublished', String(form.isPublished));
      payload.append('document', form.document);
      await api.post('/admin/admission-documents', payload);
      setForm({ title: '', description: '', category: 'prospectus', isPublished: true, document: null });
      formElement.reset();
      await load();
      setMessage({ kind: 'success', text: 'Admission document uploaded successfully.' });
    } catch (error) { setMessage({ kind: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  async function togglePublished(item) {
    try {
      await api.patch(`/admin/admission-documents/${item._id}`, { isPublished: !item.isPublished });
      await load();
      setMessage({ kind: 'success', text: item.isPublished ? 'Document removed from the public page.' : 'Document published on the admission resources page.' });
    } catch (error) { setMessage({ kind: 'error', text: getErrorMessage(error) }); }
  }

  async function remove(item) {
    if (!window.confirm(`Permanently delete “${item.title}” and its PDF?`)) return;
    try {
      await api.delete(`/admin/admission-documents/${item._id}`);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      setMessage({ kind: 'success', text: 'Admission document deleted.' });
    } catch (error) { setMessage({ kind: 'error', text: getErrorMessage(error) }); }
  }

  return <div className="admin-content">
    <div className="admin-page-intro"><div><h2>Admission resources</h2><p>Upload the latest prospectus, admission forms, fee documents, and school instructions.</p></div><span className="admin-count-badge">{items.length} files</span></div>
    {message.text && <p className={`admin-inline-feedback ${message.kind}`} role="status">{message.text}</p>}
    <div className="admin-content-manager-grid">
      <form className="admin-panel admin-upload-panel" onSubmit={submit}>
        <div className="admin-panel-heading"><div><h3>Upload a PDF resource</h3><p>PDF only · maximum 15 MB</p></div><Upload size={21}/></div>
        <label>Document title<input required minLength={3} maxLength={180} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Prospectus 2026–27"/></label>
        <label>Resource type<select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Description (optional)<textarea rows={3} maxLength={1200} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What should families know about this document?"/></label>
        <label className="admin-file-picker"><Upload size={20}/><span>{form.document?.name || 'Choose a PDF file'}</span><input type="file" accept="application/pdf,.pdf" required onChange={(event) => setForm((current) => ({ ...current, document: event.target.files?.[0] || null }))}/></label>
        <label className="admin-check-row"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}/><span>Make this resource publicly downloadable</span></label>
        <button className="button button-primary button-wide" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/> Uploading…</> : <>Upload resource <Upload size={16}/></>}</button>
      </form>
      <section className="admin-panel admin-managed-list"><div className="admin-panel-heading"><div><h3>Manage admission resources</h3><p>Only published documents appear on the public admission resources page.</p></div><FileText size={21}/></div>
        {items.length ? <div className="admin-managed-items">{items.map((item) => <article className="admin-managed-item" key={item._id}>
          <div className="admin-managed-item-main"><div className="admin-managed-item-meta"><span className={`status-pill ${item.isPublished ? 'status-admitted' : 'status-closed'}`}>{item.isPublished ? 'Published' : 'Hidden'}</span><small>{categories.find(([value]) => value === item.category)?.[1] || 'Other'}</small></div><strong>{item.title}</strong>{item.description && <p>{item.description}</p>}<a className="admin-document-link" href={getMediaUrl(item.fileUrl)} target="_blank" rel="noreferrer"><Download size={15}/>{item.fileName || 'Open PDF'} ({Math.max(1, Math.round((item.fileSize || 0) / 1024))} KB)</a></div>
          <div className="admin-managed-actions"><button type="button" className="admin-icon-btn" onClick={() => togglePublished(item)} aria-label={item.isPublished ? 'Hide document' : 'Publish document'} title={item.isPublished ? 'Hide' : 'Publish'}>{item.isPublished ? <EyeOff size={16}/> : <Eye size={16}/>}</button><button type="button" className="admin-icon-btn danger" onClick={() => remove(item)} aria-label={`Delete ${item.title}`} title="Delete"><Trash2 size={16}/></button></div>
        </article>)}</div> : <div className="admin-empty-state"><FileText size={26}/><p>No admission resources have been uploaded yet.</p></div>}
      </section>
    </div>
  </div>;
}
