import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck, BookOpen, Check, Edit3, Eye, EyeOff, FileImage, LoaderCircle,
  Mail, Plus, Save, Search, ShieldCheck, Trash2, Upload, UserRound, X,
} from 'lucide-react';
import api, { getErrorMessage, getMediaUrl } from '../lib/api';

const emptyForm = () => ({
  fullName: '', designation: 'Teacher', staffType: 'teaching', department: '',
  subjectsTaught: '', qualifications: '', specialization: '', experienceYears: '0',
  joiningYear: '', bio: '', achievements: '', languages: '', email: '', displayOrder: '0',
  isVerified: false, isPublished: false, isFeatured: false, removePhoto: false, photo: null,
});

const designations = [
  'Principal', 'Vice Principal', 'Head of Department', 'PGT', 'TGT', 'PRT',
  'Pre-Primary Teacher', 'Subject Teacher', 'Librarian', 'Lab Assistant',
  'Sports Coach', 'Counsellor', 'Office Staff', 'Support Staff', 'Other',
];

export default function FacultyManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [staffTypeFilter, setStaffTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: '', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/faculty');
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !query || [item.fullName, item.designation, item.department, item.subjectsTaught, item.qualifications]
        .some((value) => String(value || '').toLowerCase().includes(query));
      const matchesType = staffTypeFilter === 'all' || item.staffType === staffTypeFilter;
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'published' && item.isPublished && item.isVerified)
        || (statusFilter === 'draft' && !item.isPublished)
        || (statusFilter === 'unverified' && !item.isVerified);
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [items, search, staffTypeFilter, statusFilter]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function startCreate() {
    setEditingId('');
    setForm(emptyForm());
    setNotice({ kind: '', text: '' });
    document.getElementById('faculty-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      ...emptyForm(),
      fullName: item.fullName || '', designation: item.designation || 'Teacher',
      staffType: item.staffType || 'teaching', department: item.department || '',
      subjectsTaught: item.subjectsTaught || '', qualifications: item.qualifications || '',
      specialization: item.specialization || '', experienceYears: String(item.experienceYears ?? 0),
      joiningYear: item.joiningYear == null ? '' : String(item.joiningYear), bio: item.bio || '',
      achievements: item.achievements || '', languages: item.languages || '', email: item.email || '',
      displayOrder: String(item.displayOrder ?? 0), isVerified: Boolean(item.isVerified),
      isPublished: Boolean(item.isPublished), isFeatured: Boolean(item.isFeatured),
      removePhoto: false, photo: null,
    });
    setNotice({ kind: '', text: '' });
    document.getElementById('faculty-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEdit() {
    setEditingId('');
    setForm(emptyForm());
    setNotice({ kind: '', text: '' });
  }

  async function submitForm(event) {
    event.preventDefault();
    if (form.isPublished && !form.isVerified) {
      setNotice({ kind: 'error', text: 'Verify the staff member before publishing the profile.' });
      return;
    }
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'photo') {
        if (value) payload.append('photo', value);
      } else if (value !== undefined && value !== null) {
        payload.append(key, typeof value === 'boolean' ? String(value) : String(value));
      }
    });
    setBusy(true);
    setNotice({ kind: '', text: '' });
    try {
      const path = editingId ? `/admin/faculty/${editingId}` : '/admin/faculty';
      const { data } = editingId
        ? await api.patch(path, payload)
        : await api.post(path, payload);
      setNotice({ kind: 'success', text: editingId ? 'Faculty profile updated.' : 'Faculty profile created.' });
      setEditingId('');
      setForm(emptyForm());
      await load();
      if (data?.data?._id) setNotice({ kind: 'success', text: editingId ? 'Faculty profile updated.' : 'Faculty profile created.' });
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(item) {
    if (!window.confirm(`Permanently delete the profile for ${item.fullName}? This also removes its uploaded photo.`)) return;
    setBusy(true);
    setNotice({ kind: '', text: '' });
    try {
      await api.delete(`/admin/faculty/${item._id}`);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      if (editingId === item._id) cancelEdit();
      setNotice({ kind: 'success', text: `${item.fullName}'s profile was deleted.` });
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  const editingItem = items.find((item) => item._id === editingId);
  const currentPhoto = editingItem?.photoUrl && !form.removePhoto ? getMediaUrl(editingItem.photoUrl) : '';
  const selectedPhotoPreview = useMemo(() => form.photo ? URL.createObjectURL(form.photo) : '', [form.photo]);

  useEffect(() => () => {
    if (selectedPhotoPreview) URL.revokeObjectURL(selectedPhotoPreview);
  }, [selectedPhotoPreview]);

  return (
    <div className="admin-content faculty-admin-content">
      <div className="admin-page-intro">
        <div>
          <h2>Faculty directory</h2>
          <p>Add and maintain approved teaching and non-teaching staff profiles.</p>
        </div>
        <span className="admin-count-badge">{items.length} profiles</span>
      </div>

      {notice.text && <div className={`admin-notice ${notice.kind === 'error' ? 'error' : ''}`} role="status">
        {notice.kind === 'error' ? <X size={16}/> : <Check size={16}/>}<span>{notice.text}</span>
        <button type="button" onClick={() => setNotice({ kind: '', text: '' })} aria-label="Dismiss message"><X size={15}/></button>
      </div>}

      <section className="admin-panel faculty-editor-panel" id="faculty-editor">
        <div className="admin-panel-heading">
          <div>
            <h3>{editingId ? 'Edit faculty profile' : 'Add a faculty member'}</h3>
            <p>Publish a profile only after the school has verified the staff details and approved any photograph.</p>
          </div>
          {editingId ? <Edit3 size={22}/> : <Plus size={22}/>}
        </div>
        <form onSubmit={submitForm} className="faculty-admin-form">
          <div className="faculty-form-grid">
            <label>Full name *<input value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} required minLength={2} maxLength={120} autoComplete="name" placeholder="e.g. Ms. Ananya Sharma"/></label>
            <label>Designation *<input list="faculty-designation-options" value={form.designation} onChange={(e) => setField('designation', e.target.value)} required minLength={2} maxLength={100} placeholder="e.g. PGT Computer Science"/><datalist id="faculty-designation-options">{designations.map((item) => <option key={item} value={item}/>)}</datalist></label>
            <label>Staff category *<select value={form.staffType} onChange={(e) => setField('staffType', e.target.value)}><option value="teaching">Teaching staff</option><option value="non-teaching">Non-teaching staff</option></select></label>
            <label>Department / section<input value={form.department} onChange={(e) => setField('department', e.target.value)} maxLength={100} placeholder="e.g. Science / Primary Section"/></label>
            <label>Subjects taught<input value={form.subjectsTaught} onChange={(e) => setField('subjectsTaught', e.target.value)} maxLength={250} placeholder="e.g. Physics, Mathematics"/></label>
            <label>Qualifications<input value={form.qualifications} onChange={(e) => setField('qualifications', e.target.value)} maxLength={300} placeholder="Only verified qualifications"/></label>
            <label>Specialization<input value={form.specialization} onChange={(e) => setField('specialization', e.target.value)} maxLength={250} placeholder="e.g. Physics education"/></label>
            <label>Professional experience (years)<input type="number" min="0" max="60" step="1" value={form.experienceYears} onChange={(e) => setField('experienceYears', e.target.value)} required/></label>
            <label>Year joined school<input type="number" min="1950" max={new Date().getFullYear()} step="1" value={form.joiningYear} onChange={(e) => setField('joiningYear', e.target.value)} placeholder="Optional"/></label>
            <label>Professional email (optional)<input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} maxLength={254} autoComplete="email" placeholder="school-issued email preferred"/></label>
            <label>Languages<input value={form.languages} onChange={(e) => setField('languages', e.target.value)} maxLength={250} placeholder="e.g. Hindi, English"/></label>
            <label>Display order<input type="number" min="0" max="10000" step="1" value={form.displayOrder} onChange={(e) => setField('displayOrder', e.target.value)} required/><small>Lower values appear first.</small></label>
            <label className="faculty-field-wide">Profile / teaching philosophy<textarea value={form.bio} onChange={(e) => setField('bio', e.target.value)} maxLength={2000} rows={4} placeholder="A concise professional introduction. Avoid private or unverified personal details."/></label>
            <label className="faculty-field-wide">Awards and achievements<textarea value={form.achievements} onChange={(e) => setField('achievements', e.target.value)} maxLength={1200} rows={3} placeholder="Only achievements verified by the school."/></label>
          </div>

          <div className="faculty-photo-upload">
            <div className="faculty-photo-preview">
              {selectedPhotoPreview || currentPhoto ? <img src={selectedPhotoPreview || currentPhoto} alt="Faculty profile preview"/> : <UserRound size={34}/>}
            </div>
            <div className="faculty-photo-fields">
              <strong>Profile photograph</strong>
              <p>Optional · JPG, PNG, WEBP or GIF · maximum 5 MB. Upload only with permission to publish.</p>
              <label className="admin-file-picker"><Upload size={19}/><span>{form.photo?.name || (currentPhoto ? 'Replace current photograph' : 'Choose a photograph')}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { setField('photo', e.target.files?.[0] || null); if (e.target.files?.[0]) setField('removePhoto', false); }}/></label>
              {editingId && currentPhoto && <label className="faculty-remove-photo"><input type="checkbox" checked={form.removePhoto} onChange={(e) => { setField('removePhoto', e.target.checked); if (e.target.checked) setField('photo', null); }}/> Remove the current photograph</label>}
            </div>
          </div>

          <div className="faculty-publish-options">
            <label className="faculty-check-option"><input type="checkbox" checked={form.isVerified} onChange={(e) => setForm((current) => ({ ...current, isVerified: e.target.checked, isPublished: e.target.checked ? current.isPublished : false }))}/><span><strong><ShieldCheck size={16}/> Verified by the school</strong><small>Check only after confirming current role, qualifications and permission to publish.</small></span></label>
            <label className="faculty-check-option"><input type="checkbox" checked={form.isPublished} disabled={!form.isVerified} onChange={(e) => setField('isPublished', e.target.checked)}/><span><strong>{form.isPublished ? <Eye size={16}/> : <EyeOff size={16}/>} Publish on the public website</strong><small>Unpublished and unverified profiles are visible only in the admin dashboard.</small></span></label>
            <label className="faculty-check-option"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)}/><span><strong><BadgeCheck size={16}/> Feature this profile</strong><small>Featured verified profiles appear first in the public directory.</small></span></label>
          </div>

          <div className="admin-form-footer faculty-form-footer">
            <p><ShieldCheck size={16}/> Avoid personal home addresses, private phone numbers, identity numbers or other unnecessary personal data in public profiles.</p>
            <div className="faculty-form-actions">
              {editingId && <button type="button" className="button button-outline-dark" onClick={cancelEdit} disabled={busy}><X size={16}/> Cancel</button>}
              <button type="submit" className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/> Saving…</> : <><Save size={17}/>{editingId ? 'Save profile' : 'Create profile'}</>}</button>
            </div>
          </div>
        </form>
      </section>

      <section className="admin-panel faculty-list-panel">
        <div className="admin-panel-heading">
          <div><h3>Staff profiles</h3><p>Search, edit, publish/unpublish, verify and remove directory records.</p></div>
          <button type="button" className="button button-outline-dark faculty-add-button" onClick={startCreate}><Plus size={16}/> Add profile</button>
        </div>
        <div className="faculty-admin-filters">
          <label className="faculty-search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, designation, subject…" aria-label="Search faculty profiles"/></label>
          <select value={staffTypeFilter} onChange={(e) => setStaffTypeFilter(e.target.value)} aria-label="Filter by staff category"><option value="all">All staff</option><option value="teaching">Teaching</option><option value="non-teaching">Non-teaching</option></select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by publication status"><option value="all">All statuses</option><option value="published">Published & verified</option><option value="draft">Unpublished</option><option value="unverified">Not verified</option></select>
        </div>
        {loading ? <div className="faculty-loading"><LoaderCircle size={22} className="spin"/> Loading faculty…</div> : filteredItems.length ? <div className="faculty-admin-list">{filteredItems.map((item) => <article className="faculty-admin-row" key={item._id}>
          <div className="faculty-admin-avatar">{item.photoUrl ? <img src={getMediaUrl(item.photoUrl)} alt=""/> : <UserRound size={27}/>}</div>
          <div className="faculty-admin-row-main"><div className="faculty-admin-row-title"><h4>{item.fullName}</h4><span className={`faculty-status ${item.isPublished && item.isVerified ? 'is-published' : item.isVerified ? 'is-verified' : 'is-draft'}`}>{item.isPublished && item.isVerified ? 'Published' : item.isVerified ? 'Verified · Draft' : 'Unverified'}</span></div><p>{item.designation}{item.department ? ` · ${item.department}` : ''}</p><div className="faculty-admin-row-meta"><small>{item.staffType === 'teaching' ? 'Teaching' : 'Non-teaching'}</small>{item.subjectsTaught && <small>{item.subjectsTaught}</small>}{item.qualifications && <small>{item.qualifications}</small>}</div></div>
          <div className="faculty-admin-row-actions"><button type="button" className="admin-icon-btn" onClick={() => startEdit(item)} aria-label={`Edit ${item.fullName}`} title="Edit profile"><Edit3 size={16}/></button><button type="button" className="admin-icon-btn danger" onClick={() => deleteItem(item)} disabled={busy} aria-label={`Delete ${item.fullName}`} title="Delete profile"><Trash2 size={16}/></button></div>
        </article>)}</div> : <div className="faculty-empty"><BookOpen size={28}/><strong>{items.length ? 'No matching profiles' : 'No faculty profiles yet'}</strong><p>{items.length ? 'Try a different search or filter.' : 'Add a profile above. It will remain private until it is verified and published.'}</p></div>}
      </section>
    </div>
  );
}
