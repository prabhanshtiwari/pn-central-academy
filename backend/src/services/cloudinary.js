import crypto from 'node:crypto';
import fs from 'node:fs/promises';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
export const cloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret);

function signature(params) {
  const payload = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export async function uploadToCloudinary(file, folder) {
  if (!cloudinaryEnabled) return null;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { folder: `pnca/${folder}`, timestamp };
  const form = new FormData();
  form.append('file', new Blob([await fs.readFile(file.path)], { type: file.mimetype }), file.filename);
  form.append('api_key', apiKey);
  for (const [key, value] of Object.entries(params)) form.append(key, value);
  form.append('signature', signature(params));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(result?.error?.message || 'Cloudinary image upload failed. Check Cloudinary configuration.');
  }
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFromCloudinary(url) {
  if (!cloudinaryEnabled || !url || !url.startsWith(`https://res.cloudinary.com/${cloudName}/`)) return;
  // Derive public_id from Cloudinary delivery URL. Public IDs are stored in URL paths after /upload/.
  const parsed = new URL(url);
  const parts = parsed.pathname.split('/upload/');
  if (parts.length !== 2) return;
  const publicId = parts[1].replace(/^v\d+\//, '').replace(/\.[a-zA-Z0-9]+$/, '');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { public_id: publicId, timestamp };
  const form = new URLSearchParams({ ...params, api_key: apiKey, signature: signature(params) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
  if (!response.ok) throw new Error('Cloudinary asset deletion failed.');
}
