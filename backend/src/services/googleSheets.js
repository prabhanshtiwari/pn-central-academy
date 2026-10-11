/**
 * Google Sheets integration uses a school-owned Google Apps Script web app.
 * No Google credentials are shipped with the source. Configure the URL and
 * shared secret in backend/.env. The Apps Script endpoint must upsert by the
 * enquiry ID so retries never create duplicate rows.
 */
export async function syncEnquiryToGoogleSheet(enquiry) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim();

  if (!url || !secret) {
    return { status: 'pending', error: 'Google Sheets integration is not configured.' };
  }

  const payload = {
    secret,
    event: 'admission-enquiry',
    record: {
      id: String(enquiry._id),
      submittedAt: enquiry.createdAt ? new Date(enquiry.createdAt).toISOString() : new Date().toISOString(),
      guardianName: enquiry.guardianName || '',
      studentName: enquiry.studentName || '',
      phone: enquiry.phone || '',
      email: enquiry.email || '',
      address: enquiry.address || '',
      classInterested: enquiry.classInterested || '',
      message: enquiry.message || '',
      status: enquiry.status || 'new',
      consentAcceptedAt: enquiry.consentAcceptedAt ? new Date(enquiry.consentAcceptedAt).toISOString() : '',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = null; }
    if (!response.ok || data?.success !== true) {
      const detail = typeof data?.message === 'string' ? data.message.slice(0, 220) : `Google Sheets endpoint returned HTTP ${response.status}.`;
      return { status: 'failed', error: detail };
    }
    return { status: 'synced', syncedAt: new Date(), error: '' };
  } catch (error) {
    const message = error?.name === 'TimeoutError' || error?.name === 'AbortError'
      ? 'Google Sheets request timed out; retry the sync.'
      : 'Google Sheets could not be reached; check the webhook configuration and network.';
    return { status: 'failed', error: message };
  }
}
