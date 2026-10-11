# Local setup checklist

1. Install Node.js 20+ and MongoDB locally or create an Atlas database.
2. From the project root, run `npm run setup`.
3. The supplied project archive includes `backend/.env` and `frontend/.env` from the project you provided. Keep those local files in place for this copy; review them locally before starting. If you intentionally need a clean configuration, back up the current `.env` and copy `backend/.env.example` to `backend/.env`.
4. Confirm `MONGODB_URI`, `CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` with at least 12 characters are valid in `backend/.env`. Do not commit `.env` files to Git or copy server secrets into frontend variables.
5. The Google Sheets values in the supplied backend `.env` are preserved exactly as provided. If those values point to a valid deployed Apps Script, leave them unchanged; otherwise, use the existing Google Sheets guide to deploy/configure the webhook. Enquiries still save in MongoDB if sheet sync is unavailable.
6. Start with `npm run dev`.
7. Open the public website at `http://localhost:5173`, admin at `http://localhost:5173/admin`, and API health at `http://localhost:5000/api/health`.
8. Sign in, change the admin password if using generated credentials, and review Settings to confirm phone, WhatsApp, email, address and school facts.
9. In Admin → Faculty, add a staff profile using verified professional details, upload an approved photo if available, and check **Verified by the school** before publishing. Confirm it appears at `/staff`, and confirm a draft/unverified profile does not appear publicly.
10. Upload a test PDF in Admin → Admission documents; confirm it appears on `/admission-resources` only when published. Create a test notice and verify date/expiry behaviour on `/notices`.
11. Run `npm run check` before any deployment. This requires dependencies to be installed.

For Google Sheets configuration, read the full section in the root `README.md` and follow `docs/google-sheets-webhook.gs` comments.
