/** Build the official WhatsApp Click to Chat URL for the school’s public number. */
export function getWhatsAppUrl(phone, message = 'Hello P.N. Central Academy, I would like to enquire about admissions.') {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  // Accept common Indian formats: 10-digit local, leading-zero local, or +91.
  if (digits.length === 10) digits = `91${digits}`;
  else if (digits.length === 11 && digits.startsWith('0')) digits = `91${digits.slice(1)}`;

  if (digits.length < 10 || digits.length > 15) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
