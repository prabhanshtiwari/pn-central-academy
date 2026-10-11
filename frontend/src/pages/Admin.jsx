import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Check, CircleAlert, FileImage, Inbox, LayoutDashboard,
  LoaderCircle, LogOut, Mail, MessageSquare, RefreshCw, Save, Settings2, ShieldCheck,
  Trash2, Upload, Users, X, Megaphone, Files,
} from 'lucide-react';
import api, { getErrorMessage, getMediaUrl } from '../lib/api';
import { useSite } from '../components/SiteContext';
import AdminNoticeManager from '../components/AdminNoticeManager';
import AdminAdmissionDocuments from '../components/AdminAdmissionDocuments';
import FacultyManager from '../components/FacultyManager';

const blankLogin = { email: '', password: '' };
const settingsFields = [
  ['schoolName', 'School name'], ['heroEyebrow', 'Hero eyebrow'], ['heroTitle', 'Hero headline'],
  ['heroSubtitle', 'Hero description'], ['introTitle', 'About headline'], ['introText', 'About paragraph'],
  ['phonePrimary', 'Primary phone'], ['phoneSecondary', 'Secondary phone'], ['phoneWhatsapp', 'WhatsApp phone'], ['email', 'Public email'], ['address', 'School address'],
];

export default function Admin() {
  const { settings, setSettings } = useSite();
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginForm, setLoginForm] = useState(blankLogin);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [settingsForm, setSettingsForm] = useState(settings);
  const [galleryForm, setGalleryForm] = useState({ title: '', caption: '', category: 'Campus life', image: null });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notice, setNotice] = useState({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);

  const loadDashboard = useCallback(async () => {
    const [statsResponse, enquiriesResponse, messagesResponse, galleryResponse, contentResponse] = await Promise.all([
      api.get('/admin/stats'), api.get('/admin/enquiries?limit=100'), api.get('/admin/messages'), api.get('/admin/gallery'), api.get('/content'),
    ]);
    setStats(statsResponse.data.data);
    setEnquiries(enquiriesResponse.data.data || []);
    setMessages(messagesResponse.data.data || []);
    setGallery(galleryResponse.data.data || []);
    if (contentResponse.data.data) {
      setSettingsForm((current) => ({ ...current, ...contentResponse.data.data }));
      setSettings((current) => ({ ...current, ...contentResponse.data.data }));
    }
  }, [setSettings]);

  useEffect(() => {
    let active = true;
    api.get('/admin/stats').then(async () => {
      if (!active) return;
      try { await loadDashboard(); if (active) setSignedIn(true); }
      catch { if (active) setSignedIn(false); }
    }).catch(() => {}).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [loadDashboard]);

  async function submitLogin(event) {
    event.preventDefault(); setLoginError(''); setBusy(true);
    try {
      await api.post('/admin/login', loginForm);
      await loadDashboard();
      setSignedIn(true);
      setLoginForm((current) => ({ ...current, password: '' }));
      setNotice({ kind: 'success', text: 'Signed in successfully.' });
    } catch (error) { setLoginError(getErrorMessage(error)); }
    finally { setBusy(false); }
  }

  async function signOut() {
    try { await api.post('/admin/logout'); } catch { /* the local admin view still closes */ }
    setSignedIn(false); setStats(null); setEnquiries([]); setMessages([]); setGallery([]); setNotice({ kind: '', text: '' });
  }

  async function refresh() {
    setBusy(true); setNotice({ kind: '', text: '' });
    try { await loadDashboard(); setNotice({ kind: 'success', text: 'Dashboard refreshed.' }); }
    catch (error) { setNotice({ kind: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  async function updateEnquiry(id, patch) {
    try {
      const { data } = await api.patch(`/admin/enquiries/${id}`, patch);
      setEnquiries((current) => current.map((item) => item._id === id ? data.data : item));
      setNotice({ kind: 'success', text: 'Enquiry updated.' });
      await loadDashboard();
    } catch (error) { setNotice({ kind: 'error', text: getErrorMessage(error) }); }
  }

  async function syncEnquiry(id) {
    setBusy(true);
    try {
      const { data } = await api.post(`/admin/enquiries/${id}/sync-google-sheet`);
      setNotice({ kind: 'success', text: data.message || 'Enquiry synced to Google Sheets.' });
      await loadDashboard();
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
      try { await loadDashboard(); } catch { /* keep current dashboard data visible */ }
    } finally { setBusy(false); }
  }

  async function updateMessage(id, patch) {
    try {
      const { data } = await api.patch(`/admin/messages/${id}`, patch);
      setMessages((current) => current.map((item) => item._id === id ? data.data : item));
      setNotice({ kind: 'success', text: 'Message updated.' });
      await loadDashboard();
    } catch (error) { setNotice({ kind: 'error', text: getErrorMessage(error) }); }
  }

  async function saveSettings(event) {
    event.preventDefault(); setBusy(true); setNotice({ kind: '', text: '' });
    try {
      const { data } = await api.patch('/admin/settings', {
        schoolName: settingsForm.schoolName, heroEyebrow: settingsForm.heroEyebrow, heroTitle: settingsForm.heroTitle,
        heroSubtitle: settingsForm.heroSubtitle, introTitle: settingsForm.introTitle, introText: settingsForm.introText,
        phonePrimary: settingsForm.phonePrimary, phoneSecondary: settingsForm.phoneSecondary, phoneWhatsapp: settingsForm.phoneWhatsapp,
        email: settingsForm.email, address: settingsForm.address, admissionsOpen: settingsForm.admissionsOpen,
      });
      setSettings((current) => ({ ...current, ...data.data }));
      setNotice({ kind: 'success', text: 'Public website content saved.' });
    } catch (error) { setNotice({ kind: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice({ kind: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 12) {
      setNotice({ kind: 'error', text: 'Use at least 12 characters for the new password.' });
      return;
    }
    setBusy(true); setNotice({ kind: '', text: '' });
    try {
      const { data } = await api.patch('/admin/password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice({ kind: 'success', text: data.message || 'Password updated.' });
    } catch (error) { setNotice({ kind: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  async function uploadImage(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!galleryForm.image) return setNotice({ kind: 'error', text: 'Please choose an image file.' });
    const payload = new FormData();
    payload.append('image', galleryForm.image); payload.append('title', galleryForm.title); payload.append('caption', galleryForm.caption); payload.append('category', galleryForm.category);
    setBusy(true); setNotice({ kind: '', text: '' });
    try {
      await api.post('/admin/gallery', payload);
      setGalleryForm({ title: '', caption: '', category: 'Campus life', image: null });
      formElement.reset();
      await loadDashboard();
      setNotice({ kind: 'success', text: 'Image uploaded and published to the public gallery.' });
    } catch (error) { setNotice({ kind: 'error', text: getErrorMessage(error) }); }
    finally { setBusy(false); }
  }

  async function deleteGalleryItem(item) {
    if (!window.confirm(`Delete “${item.title}” from the gallery?`)) return;
    try { await api.delete(`/admin/gallery/${item._id}`); setGallery((current) => current.filter((entry) => entry._id !== item._id)); setNotice({ kind: 'success', text: 'Gallery item deleted.' }); }
    catch (error) { setNotice({ kind: 'error', text: getErrorMessage(error) }); }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'enquiries', label: 'Enquiries', icon: Inbox },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'admission-documents', label: 'Admission documents', icon: Files },
    { id: 'gallery', label: 'Gallery', icon: FileImage },
    { id: 'settings', label: 'Website content', icon: Settings2 },
  ];

  if (checking) return <div className="admin-boot"><LoaderCircle className="spin" size={27}/><p>Checking admin session…</p></div>;
  if (!signedIn) return <main className="admin-login-page"><div className="admin-login-brand"><Link to="/" className="brand"><span className="brand-mark"><img src="/assets/pn-central-academy-logo.png" alt="" /></span><span className="brand-copy"><strong>P.N. CENTRAL</strong><small>ACADEMY · PRAYAGRAJ</small></span></Link></div><div className="admin-login-layout"><div className="admin-login-left"><span className="admin-lock"><ShieldCheck size={25}/></span><p className="eyebrow eyebrow-light">SECURE SCHOOL ADMIN</p><h1>Everything your website team needs, in one place.</h1><p>Review admission enquiries, respond to messages and keep the public website details up to date.</p><Link to="/" className="admin-back-link"><ArrowLeft size={16}/> Back to public website</Link><div className="admin-login-decor">PNCA<span> · </span>ADMINISTRATION</div></div><div className="admin-login-card"><p className="eyebrow">ADMIN SIGN IN</p><h2>Welcome back.</h2><p>Sign in using the credentials saved during the first server start.</p><form onSubmit={submitLogin}><label>Admin email<input type="email" required maxLength={254} autoComplete="username" placeholder="Enter the exact ADMIN_EMAIL set on Render" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}/></label><label>Password<input type="password" required maxLength={200} autoComplete="current-password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}/></label>{loginError && <p className="form-error" role="alert">{loginError}</p>}<button className="button button-primary button-wide" disabled={busy}>{busy ? <><LoaderCircle size={18} className="spin"/> Checking…</> : <>Sign in <ArrowUpRight size={17}/></>}</button></form><div className="admin-login-hint"><CircleAlert size={17}/><p>On first run, credentials are written to <code>backend/.admin-credentials</code>. Do not share or commit that file.</p></div></div></div><div className="admin-login-footer">Authorised staff only · Session expires after 8 hours</div></main>;

  return <main className="admin-shell"><aside className="admin-sidebar"><Link to="/" className="brand brand-admin"><span className="brand-mark"><img src="/assets/pn-central-academy-logo.png" alt="" /></span><span className="brand-copy"><strong>P.N. CENTRAL</strong><small>ACADEMY · ADMIN</small></span></Link><div className="admin-sidebar-label">WORKSPACE</div><nav>{tabs.map((tab) => { const Icon = tab.icon; return <button className={activeTab === tab.id ? 'admin-nav-item active' : 'admin-nav-item'} key={tab.id} onClick={() => { setActiveTab(tab.id); setNotice({ kind: '', text: '' }); }}><Icon size={18}/><span>{tab.label}</span>{tab.id === 'enquiries' && stats?.enquiriesNew > 0 && <em>{stats.enquiriesNew}</em>}</button>; })}</nav><div className="admin-sidebar-bottom"><div className="admin-avatar">PN</div><div><strong>School administrator</strong><small>Authorised access</small></div><button onClick={signOut} aria-label="Sign out"><LogOut size={17}/></button></div></aside>
    <section className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">Workspace <span>/</span> {tabs.find((tab) => tab.id === activeTab)?.label}</span><h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1></div><div className="admin-top-actions"><span className="admin-secure-status"><span/> Private admin</span><button className="admin-icon-btn" onClick={refresh} aria-label="Refresh dashboard" disabled={busy}><RefreshCw size={17} className={busy ? 'spin' : ''}/></button><button className="admin-top-logout" onClick={signOut}><LogOut size={16}/> Sign out</button></div></header>
      {notice.text && <div className={`admin-notice ${notice.kind}`} role="status">{notice.kind === 'error' ? <CircleAlert size={17}/> : <Check size={17}/>}<span>{notice.text}</span><button aria-label="Dismiss notification" onClick={() => setNotice({ kind: '', text: '' })}><X size={15}/></button></div>}
      {activeTab === 'overview' && <div className="admin-content"><div className="admin-welcome-banner"><div><p className="eyebrow eyebrow-light">ADMIN DASHBOARD</p><h2>Good work starts with a clear view.</h2><p>Review fresh enquiries and keep school information accurate.</p></div><div className="admin-welcome-icon"><ShieldCheck size={45}/></div></div><div className="admin-stat-grid"><StatCard label="Total enquiries" value={stats?.enquiriesTotal ?? 0} detail={`${stats?.enquiriesNew ?? 0} new to review`} icon={Inbox}/><StatCard label="Contact messages" value={stats?.messagesTotal ?? 0} detail={`${stats?.messagesNew ?? 0} unread`} icon={Mail}/><StatCard label="Gallery images" value={stats?.galleryTotal ?? 0} detail="Published and unpublished" icon={FileImage}/><StatCard label="Google Sheet sync" value={stats?.googleSheetPending ?? 0} detail="enquiries pending sync" icon={RefreshCw}/></div><div className="admin-overview-grid"><div className="admin-panel"><div className="admin-panel-heading"><div><h3>Latest admission enquiries</h3><p>The newest requests from families.</p></div><button className="admin-small-link" onClick={() => setActiveTab('enquiries')}>View all <ArrowUpRight size={14}/></button></div>{enquiries.slice(0, 5).length ? <div className="admin-activity-list">{enquiries.slice(0, 5).map((item) => <div className="admin-activity-item" key={item._id}><span className="admin-activity-avatar">{item.guardianName?.slice(0, 1).toUpperCase() || 'P'}</span><div><strong>{item.guardianName}</strong><small>{item.classInterested} · {item.phone}</small></div><StatusPill status={item.status}/></div>)}</div> : <EmptyState text="New website enquiries will appear here."/>}</div><div className="admin-panel admin-quick-panel"><div className="admin-panel-heading"><div><h3>Quick actions</h3><p>Keep the public website current.</p></div></div><button onClick={() => setActiveTab('settings')}><Settings2 size={18}/><span><strong>Update website content</strong><small>Headlines, address, phone and email</small></span><ArrowUpRight size={16}/></button><button onClick={() => setActiveTab('gallery')}><Upload size={18}/><span><strong>Publish a gallery photo</strong><small>Add campus images for visitors</small></span><ArrowUpRight size={16}/></button><button onClick={() => setActiveTab('faculty')}><Users size={18}/><span><strong>Manage faculty profiles</strong><small>Add verified staff details and photographs</small></span><ArrowUpRight size={16}/></button><button onClick={() => setActiveTab('notices')}><Megaphone size={18}/><span><strong>Publish a school notice</strong><small>Post dated circulars with PDF attachments</small></span><ArrowUpRight size={16}/></button><button onClick={() => setActiveTab('admission-documents')}><Files size={18}/><span><strong>Upload admission documents</strong><small>Prospectus, forms and fee information</small></span><ArrowUpRight size={16}/></button><button onClick={() => setActiveTab('messages')}><MessageSquare size={18}/><span><strong>Review contact messages</strong><small>Follow up on visitor questions</small></span><ArrowUpRight size={16}/></button></div></div><div className="admin-footnote"><ShieldCheck size={17}/><p>Enquiry details are private. Only authorised admin accounts should access this dashboard; keep your generated credentials file secure.</p></div></div>}

      {activeTab === 'enquiries' && <div className="admin-content"><div className="admin-page-intro"><div><h2>Admission enquiries</h2><p>Review parent / guardian details and update the enquiry status.</p></div><span className="admin-count-badge">{enquiries.length} records</span></div>{enquiries.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Parent / student</th><th>Contact</th><th>Class</th><th>Received</th><th>Status</th><th>Google Sheet</th><th>Update</th></tr></thead><tbody>{enquiries.map((item) => <tr key={item._id}><td><strong>{item.guardianName}</strong><small>{item.studentName || 'Student name not provided'}</small>{item.message && <p className="admin-table-note">{item.message}</p>}</td><td><a href={`tel:${item.phone}`}>{item.phone}</a>{item.email && <small>{item.email}</small>}</td><td>{item.classInterested}</td><td>{new Date(item.createdAt).toLocaleDateString('en-IN')}</td><td><StatusPill status={item.status}/></td><td><div className="sheet-sync-cell"><span className={`sheet-sync-pill ${item.googleSheetStatus === 'synced' ? 'synced' : item.googleSheetStatus === 'failed' ? 'failed' : 'pending'}`}>{item.googleSheetStatus === 'synced' ? 'Synced' : item.googleSheetStatus === 'failed' ? 'Failed' : 'Pending'}</span>{item.googleSheetStatus !== 'synced' && <button type="button" className="admin-small-link" onClick={() => syncEnquiry(item._id)} disabled={busy}><RefreshCw size={13}/> Retry sync</button>}</div></td><td><select value={item.status} aria-label={`Status for ${item.guardianName}`} onChange={(event) => updateEnquiry(item._id, { status: event.target.value })}><option value="new">New</option><option value="contacted">Contacted</option><option value="admitted">Admitted</option><option value="closed">Closed</option></select></td></tr>)}</tbody></table></div> : <EmptyState text="No enquiries yet. New forms will appear here."/>}</div>}

      {activeTab === 'messages' && <div className="admin-content"><div className="admin-page-intro"><div><h2>Contact messages</h2><p>Messages submitted through the public contact page.</p></div><span className="admin-count-badge">{messages.length} records</span></div>{messages.length ? <div className="admin-message-grid">{messages.map((item) => <article className="admin-message-card" key={item._id}><div className="admin-message-top"><StatusPill status={item.status}/><small>{new Date(item.createdAt).toLocaleString('en-IN')}</small></div><h3>{item.subject}</h3><p>{item.message}</p><div className="admin-message-sender"><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div><label>Update status<select value={item.status} onChange={(event) => updateMessage(item._id, { status: event.target.value })}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option></select></label></article>)}</div> : <EmptyState text="There are no contact messages yet."/>}</div>}

      {activeTab === 'faculty' && <FacultyManager />}
      {activeTab === 'notices' && <AdminNoticeManager />}
      {activeTab === 'admission-documents' && <AdminAdmissionDocuments />}

      {activeTab === 'gallery' && <div className="admin-content"><div className="admin-page-intro"><div><h2>Photo gallery</h2><p>Upload and remove school photos shown on the public gallery page.</p></div><span className="admin-count-badge">{gallery.length} images</span></div><div className="admin-gallery-workspace"><form className="admin-panel admin-upload-panel" onSubmit={uploadImage}><div className="admin-panel-heading"><div><h3>Publish a new photo</h3><p>JPG, PNG, WEBP or GIF · maximum 8 MB</p></div><Upload size={21}/></div><label>Photo title<input value={galleryForm.title} onChange={(event) => setGalleryForm((current) => ({ ...current, title: event.target.value }))} maxLength={120} placeholder="Annual sports day"/></label><label>Caption (optional)<textarea value={galleryForm.caption} onChange={(event) => setGalleryForm((current) => ({ ...current, caption: event.target.value }))} rows={3} maxLength={400} placeholder="Add a short, helpful caption"/></label><label>Category<select value={galleryForm.category} onChange={(event) => setGalleryForm((current) => ({ ...current, category: event.target.value }))}><option>Campus life</option><option>Classroom</option><option>Events</option><option>Sports</option><option>Arts & culture</option><option>Facilities</option></select></label><label className="admin-file-picker"><Upload size={20}/><span>{galleryForm.image?.name || 'Choose an image'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" required onChange={(event) => setGalleryForm((current) => ({ ...current, image: event.target.files?.[0] || null }))}/></label><button className="button button-primary button-wide" disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/> Uploading…</> : <>Upload & publish <ArrowUpRight size={16}/></>}</button></form><div className="admin-panel admin-gallery-list-panel"><div className="admin-panel-heading"><div><h3>Published images</h3><p>Use only photos the school has permission to publish.</p></div></div>{gallery.length ? <div className="admin-gallery-list">{gallery.map((item) => <article className="admin-gallery-item" key={item._id}><img src={getMediaUrl(item.imageUrl)} alt=""/><div><strong>{item.title}</strong><small>{item.category} · {item.source}</small></div><button onClick={() => deleteGalleryItem(item)} aria-label={`Delete ${item.title}`}><Trash2 size={17}/></button></article>)}</div> : <EmptyState text="No images uploaded yet."/>}</div></div></div>}

      {activeTab === 'settings' && <div className="admin-content"><div className="admin-page-intro"><div><h2>Public website content</h2><p>Edit the homepage copy and the public school contact details.</p></div><span className="admin-save-note"><ShieldCheck size={16}/> Changes save to MongoDB</span></div><form className="admin-panel admin-settings-form" onSubmit={saveSettings}><div className="admin-settings-heading"><div><h3>School details</h3><p>Keep public information current. Review carefully before saving.</p></div></div><div className="admin-settings-grid">{settingsFields.map(([key, label]) => <label key={key} className={['heroTitle', 'heroSubtitle', 'introTitle', 'introText'].includes(key) ? 'settings-field-wide' : ''}>{label}{['heroSubtitle', 'introText'].includes(key) ? <textarea rows={3} value={settingsForm[key] || ''} onChange={(event) => setSettingsForm((current) => ({ ...current, [key]: event.target.value }))} maxLength={1500}/> : <input value={settingsForm[key] || ''} onChange={(event) => setSettingsForm((current) => ({ ...current, [key]: event.target.value }))} maxLength={key === 'heroTitle' ? 180 : 300} required={!['heroEyebrow', 'heroSubtitle', 'introText', 'phoneSecondary', 'phoneWhatsapp'].includes(key)}/>}</label>)}<label className="settings-field-wide admissions-toggle"><span><strong>Accepting admission enquiries</strong><small>Controls the public admissions notice.</small></span><input type="checkbox" checked={Boolean(settingsForm.admissionsOpen)} onChange={(event) => setSettingsForm((current) => ({ ...current, admissionsOpen: event.target.checked }))}/></label></div><div className="admin-form-footer"><p>These settings affect the public homepage and contact details. Review disclosure and fee information separately.</p><button className="button button-primary" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/> Saving…</> : <><Save size={17}/> Save changes</>}</button></div></form><form className="admin-panel admin-password-panel" onSubmit={savePassword}><div className="admin-settings-heading"><div><h3>Change admin password</h3><p>Choose a unique password with at least 12 characters.</p></div></div><div className="admin-settings-grid"><label>Current password<input type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} required maxLength={200}/></label><label>New password<input type="password" autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} minLength={12} required maxLength={200}/></label><label>Confirm new password<input type="password" autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} minLength={12} required maxLength={200}/></label></div><div className="admin-form-footer"><p>The generated first-run password is stored locally only for initial access. Update it after signing in.</p><button className="button button-outline-dark" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/> Updating…</> : <>Update password <ShieldCheck size={16}/></>}</button></div></form></div>}
    </section></main>;
}

function StatCard({ label, value, detail, icon: Icon }) {
  return <article className="admin-stat-card"><div className="admin-stat-icon"><Icon size={20}/></div><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}
function StatusPill({ status }) {
  const labels = { new: 'New', contacted: 'Contacted', admitted: 'Admitted', closed: 'Closed', read: 'Read', replied: 'Replied' };
  return <span className={`status-pill status-${status}`}>{labels[status] || status}</span>;
}
function EmptyState({ text }) {
  return <div className="admin-empty-state"><Inbox size={26}/><p>{text}</p></div>;
}
