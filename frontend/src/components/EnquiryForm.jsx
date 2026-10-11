import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';

const initial = { guardianName: '', studentName: '', phone: '', email: '', address: '', classInterested: '', message: '', website: '', consent: false };

export default function EnquiryForm({ compact = false }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ status: 'idle', message: '' });
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    setState({ status: 'loading', message: '' });
    try {
      const { data } = await api.post('/enquiries', form);
      setState({ status: 'success', message: data.message });
      setForm(initial);
    } catch (error) {
      setState({ status: 'error', message: getErrorMessage(error) });
    }
  }
  if (state.status === 'success') return <div className="form-success"><CheckCircle2 size={30} /><h3>Enquiry received</h3><p>{state.message}</p><button className="text-button" onClick={() => setState({ status: 'idle', message: '' })}>Send another enquiry</button></div>;

  return (
    <form className={`enquiry-form ${compact ? 'enquiry-form-compact' : ''}`} onSubmit={submit}>
      {!compact && <div className="form-intro"><p className="eyebrow">ADMISSIONS ENQUIRY</p><h3>Let’s start a conversation.</h3><p>Share a few details and the school office can follow up with you.</p></div>}
      <label className="honeypot" aria-hidden="true">Website<input autoComplete="off" tabIndex={-1} name="website" value={form.website} onChange={change} /></label>
      <div className="form-grid">
        <label>Parent / guardian name <span>*</span><input name="guardianName" value={form.guardianName} onChange={change} autoComplete="name" required minLength={2} maxLength={100} placeholder="Your full name" /></label>
        <label>Phone number <span>*</span><input type="tel" name="phone" value={form.phone} onChange={change} required pattern="[+()\-\s0-9]{7,20}" placeholder="Mobile number" /></label>
        <label>Student name<input name="studentName" value={form.studentName} onChange={change} maxLength={100} placeholder="Student’s full name" /></label>
        <label>Class interested in <span>*</span><select name="classInterested" value={form.classInterested} onChange={change} required><option value="">Select class</option>{['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_item, index) => `Class ${index + 1}`)].map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      {!compact && <>
        <label>Email address<input type="email" name="email" value={form.email} onChange={change} maxLength={254} placeholder="you@example.com" /></label>
        <label>Address<input name="address" value={form.address} onChange={change} maxLength={300} placeholder="Town / village / locality" /></label>
        <label>Anything we should know?<textarea name="message" value={form.message} onChange={change} rows={3} maxLength={1500} placeholder="Optional message" /></label>
      </>}
      {state.status === 'error' && <p className="form-error" role="alert">{state.message}</p>}
      <button className="button button-primary button-wide" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? <><LoaderCircle className="spin" size={18} /> Sending…</> : <>Submit enquiry <ArrowUpRight size={17} /></>}</button>
      <label className="consent-row"><input type="checkbox" name="consent" checked={form.consent} onChange={(event) => setForm((current) => ({ ...current, consent: event.target.checked }))} required /><span>I agree that the school office may use these details to respond to my enquiry and store them in its website database and, when configured, its school-managed Google Sheet. I will not include sensitive personal or medical information.</span></label>
      <p className="form-disclaimer">Your enquiry is saved in the website database. When Google Sheets is configured, it is also synchronised to the school-managed enquiry sheet. Please contact the office if you have privacy questions.</p>
    </form>
  );
}
