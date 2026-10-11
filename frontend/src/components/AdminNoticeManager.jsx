import { useEffect, useState } from 'react';
import { CalendarDays, Download, Eye, EyeOff, FileText, LoaderCircle, Trash2, Upload } from 'lucide-react';
import api, { getErrorMessage, getMediaUrl } from '../lib/api';

function localDateTime(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function AdminNoticeManager() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ kind: '', text: '' });
  const [form, setForm] = useState({ title: '', body: '', publishDate: localDateTime(), expiresAt: '', isPublished: true, document: null });

  async function load() {
    const { data } = await api.get('/admin/notices');
    setItems(data.data || []);
  }
  useEffect(() => { load().catch((error) => setMessage({ kind: 'error', text: getErrorMessage(error) })); }, []);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true); setMessage({ kind: '', text: '' });
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('body', form.body);
      // datetime-local values are in the administrator's local timezone; send ISO timestamps
      // so storage and publication scheduling do not depend on the API server's timezone.
      payload.append('publishDate', new Date(form.publishDate).toISOString());
      payload.append('expiresAt', form.expiresAt ? new Date(form.expiresAt).toISOString() : '');
      payload.append('isPublished', String(form.isPublished));
      if (form.document) payload.append('document', form.document);
      await api.post('/admin/notices', payload);
      setForm({ title: '', body: '', publishDate: localDateTime(), expiresAt: '', isPublished: true, document: null });
      formElement.reset();
      await load();
      setMessage({ kind: 'success', text: 'Notice saved. It will appear publicly according to its publication date and status.' });
    } catch (error) { setMessage({ kind: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  async function togglePublished(item) {
    try {
      await api.patch(`/admin/notices/${item._id}`, { isPublished: !item.isPublished });
      await load();
      setMessage({ kind: 'success', text: item.isPublished ? 'Notice unpublished.' : 'Notice published.' });
    } catch (error) { setMessage({ kind: 'error', text: getErrorMessage(error) }); }
  }

  async function remove(item) {
    if (!window.confirm(`Permanently delete the notice “${item.title}”?`)) return;
    try {
      await api.delete(`/admin/notices/${item._id}`);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      setMessage({ kind: 'success', text: 'Notice and its attached PDF were deleted.' });
    } catch (error) { setMessage({ kind: 'error', text: getErrorMessage(error) }); }
  }

  return <div className="admin-content">
    <div className="admin-page-intro"><div><h2>School notices</h2><p>Publish circulars and notices with a date and optional PDF attachment.</p></div><span className="admin-count-badge">{items.length} notices</span></div>
    {message.text && <p className={`admin-inline-feedback ${message.kind}`} role="status">{message.text}</p>}
    <div className="admin-content-manager-grid">
      <form className="admin-panel admin-upload-panel" onSubmit={submit}>
        <div className="admin-panel-heading"><div><h3>Create a notice</h3><p>PDF attachment optional · maximum 15 MB</p></div><FileText size={21}/></div>
        <label>Notice title<input required minLength={3} maxLength={180} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Admission schedule update"/></label>
        <label>Notice details<textarea required minLength={3} maxLength={8000} rows={5} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} placeholder="Write the notice details and instructions."/></label>
        <label>Publication date and time<input type="datetime-local" required value={form.publishDate} onChange={(event) => setForm((current) => ({ ...current, publishDate: event.target.value }))}/></label>
        <label>Expiry date (optional)<input type="datetime-local" value={form.expiresAt} min={form.publishDate} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}/></label>
        <label className="admin-file-picker"><Upload size={20}/><span>{form.document?.name || 'Attach a PDF circular (optional)'}</span><input type="file" accept="application/pdf,.pdf" onChange={(event) => setForm((current) => ({ ...current, document: event.target.files?.[0] || null }))}/></label>
        <label className="admin-check-row"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}/><span>Publish this notice when the publication date is reached</span></label>
        <button className="button button-primary button-wide" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/> Saving…</> : <>Save notice <Upload size={16}/></>}</button>
      </form>
      <section className="admin-panel admin-managed-list"><div className="admin-panel-heading"><div><h3>Manage notices</h3><p>Upcoming, published, and archived notices.</p></div><CalendarDays size={21}/></div>
        {items.length ? <div className="admin-managed-items">{items.map((item) => <article className="admin-managed-item" key={item._id}>
          <div className="admin-managed-item-main"><div className="admin-managed-item-meta"><span className={`status-pill ${item.isPublished ? 'status-admitted' : 'status-closed'}`}>{item.isPublished ? 'Published' : 'Draft / hidden'}</span><small>{new Date(item.publishDate).toLocaleString('en-IN')}</small></div><strong>{item.title}</strong><p>{item.body}</p>{item.attachmentUrl && <a className="admin-document-link" href={getMediaUrl(item.attachmentUrl)} target="_blank" rel="noreferrer"><Download size={15}/>{item.attachmentName || 'Open attachment'}</a>}</div>
          <div className="admin-managed-actions"><button type="button" className="admin-icon-btn" onClick={() => togglePublished(item)} aria-label={item.isPublished ? 'Unpublish notice' : 'Publish notice'} title={item.isPublished ? 'Unpublish' : 'Publish'}>{item.isPublished ? <EyeOff size={16}/> : <Eye size={16}/>}</button><button type="button" className="admin-icon-btn danger" onClick={() => remove(item)} aria-label={`Delete notice ${item.title}`} title="Delete"><Trash2 size={16}/></button></div>
        </article>)}</div> : <div className="admin-empty-state"><FileText size={26}/><p>No notices have been created yet.</p></div>}
      </section>
    </div>
  </div>;
}
