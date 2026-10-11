# P.N. Central Academy — MERN Website

A responsive React/Vite + Express/MongoDB website for P.N. Central Academy. This update extends the existing site rather than removing its existing public pages, gallery, forms, dashboard, settings, or contact-message flows.

## Included features

- Existing school pages: home, about, history, vision and mission, facilities, admissions, fee structure, staff, student corner, gallery, videos, mandatory disclosure, and contact.
- Homepage facility cards with local school asset images for smart classroom, science laboratories, computer lab, library (the included library asset is an illustration), music and playground.
- CBSE-affiliation strip on the homepage with the affiliation number and school code supplied by the project. Verify the current affiliation status and identifiers against official CBSE records before publishing.
- Contact actions for telephone (`tel:`), email (`mailto:`), and WhatsApp Click to Chat. WhatsApp opens a pre-filled message; the visitor must still press Send in WhatsApp.
- Responsive mega navigation, footer navigation, direct contact links, and rectangular school-logo rendering.
- Public school notices and circulars with publication date, optional expiry date, optional PDF attachment, and published/draft visibility.
- Public admission resources page for the prospectus, admission form, fee structure, required documents, and other school PDFs.
- Admin-only uploads and management for notices and admission resources. Uploaded documents are limited to PDF and 15 MB, and are served only through authorised routes or when explicitly published.
- Existing protected administrator dashboard, enquiry/message review, school settings, gallery management, and password-change flows.
- Verified faculty directory with public search and staff-type filters, professional profiles, approved profile photos, experience, qualifications, subjects/specialization, achievements, languages, featured ranking and optional school-issued contact email. Admins can create, update, delete, verify, publish/unpublish, feature, reorder, replace or remove photos. Public endpoints expose only profiles verified and published by the school; draft/unverified profile photos require administrator authentication.
- Enquiries remain stored in MongoDB. Optional Google Sheets sync sends each new enquiry to a school-owned Google Sheet, records the sync status, and adds an admin retry action for temporary failures.
- Server-side validation, upload file-signature checking for PDFs, secure admin cookie, rate limits, CORS allow-list, Helmet, and generated JWT secret when not configured.

## Requirements

- Node.js 20 LTS or newer and npm.
- MongoDB (local instance or MongoDB Atlas).
- A Google account controlled by the school if Google Sheets syncing is required.

## Run locally

Open a terminal in the project root (the folder containing this `README.md`).

### 1. Install packages

```bash
npm run setup
```

If your environment prefers installing the packages individually:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure the backend

The provided ZIP already includes the `.env` files from the supplied project. For this extracted copy, keep `backend/.env` and `frontend/.env` in place and verify them locally before starting. Do not print or commit their secrets. If you need a clean configuration, first make a private backup of the current files, then copy the example environment file:

**Windows PowerShell**

```powershell
Copy-Item backend/.env.example backend/.env
```

**macOS/Linux**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set at least:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pnca
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
SERVE_CLIENT=false
ADMIN_EMAIL=admin@pncentralacademy.local
ADMIN_PASSWORD=replace-with-a-unique-password-of-at-least-12-characters
COOKIE_SAME_SITE=lax
GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_WEBHOOK_SECRET=
```

The example uses a local MongoDB URI. If using Atlas, replace it with the connection string from your own cluster. Use a dedicated database user with only the permissions needed by this website; do not paste a password into code or commit `.env`.

Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (12+ characters) **before the first successful server start** if you want to choose the initial admin login yourself. If the account does not exist and `ADMIN_PASSWORD` is not set or is too short, the app generates a one-time password and stores it in `backend/.admin-credentials`. Read that file locally, sign in once, change the password in Admin → Settings, securely store the new credentials, and then delete the generated credentials file. Never share it or add it to Git.

The JWT signing secret is generated automatically and saved to `backend/.jwt-secret` if `JWT_SECRET` is not configured. Back up the secret securely for a deployed application: changing it logs out existing sessions. Do not put a JWT secret in a `VITE_*` frontend variable.

### 3. Start the frontend and API

```bash
npm run dev
```

Local URLs:

- Website: `http://localhost:5173`
- Admin sign-in: `http://localhost:5173/admin`
- API health check: `http://localhost:5000/api/health`

The server must connect to MongoDB before the first admin account and school settings can be initialised. Keep the backend terminal open to see errors. If port 5000 or 5173 is busy, stop the other process or update the corresponding configuration.

### 4. Sign in and configure the school

1. Open `http://localhost:5173/admin`.
2. Sign in using the credentials configured in `backend/.env` or the first-run credentials generated by the backend.
3. Open **Settings** to verify the school name, primary and secondary phone, WhatsApp number, email, address, and public homepage copy.
4. Change the initial password immediately and store it in a school-controlled password manager.
5. Use **Gallery** to manage photos; **Notices** for dated announcements; **Admission documents** for prospectus, application form, fee structure, and other PDF resources.
6. Use **Enquiries** to follow up on submissions. The Google Sheet status shows Synced, Pending, or Failed. Use **Retry sync** after fixing a sheet integration issue.

Only publish documents intended for public access. The admin endpoints require a valid administrator session; public downloads work only for documents marked as published. Do not upload student records, identity documents, or other sensitive personal information as public resources.

## Configure Google Sheets enquiry sync

The school must enable this integration with a Google account it controls. Until configured, enquires are still safely saved in MongoDB and shown as Pending/Failed in the admin dashboard; the application does not pretend a Google Sheet write succeeded.

1. Create a new Google Sheet owned by the school and add a tab called `Enquiries` (the script can create it if missing).
2. Open **Extensions → Apps Script** and paste the full contents of `docs/google-sheets-webhook.gs` into the script editor. Save the project.
3. In Apps Script **Project Settings → Script properties**, create:
   - `SHEET_ID`: the long ID between `/d/` and `/edit` in the Google Sheet URL.
   - `SHEET_NAME`: `Enquiries` (or the exact tab name you chose).
   - `WEBHOOK_SECRET`: a long, random secret generated specifically for this integration. Do not reuse your admin password.
4. Click **Deploy → New deployment → Web app**. Set **Execute as** to your account and select the access option required by the deployment (Apps Script may require an `Anyone` endpoint for server-to-server calls). Deploy and authorise it with the school account.
5. Copy the deployed `/exec` URL into `GOOGLE_SHEETS_WEBHOOK_URL` in `backend/.env`. Copy the same `WEBHOOK_SECRET` value into `GOOGLE_SHEETS_WEBHOOK_SECRET` in `backend/.env`. Keep both values out of frontend environment variables and source control.
6. Restart the backend. Submit a test enquiry using a test phone/email, verify that it appears in MongoDB and the Sheet, and confirm the admin row displays **Synced**.
7. If a test fails, check the Apps Script **Executions** page and backend logs. The enquiry remains in MongoDB; after correcting the endpoint or secret, use Admin → Enquiries → **Retry sync**.

The script upserts by MongoDB enquiry ID so a retry updates the existing row instead of creating duplicates. Limit sheet access to staff who need to see the information. A Google Apps Script deployment is an external service and must be monitored by the school; do not treat a Sheet as the sole copy of enquiries.

## Verified faculty directory

The public `/staff` page loads approved profiles from `GET /api/faculty`. It shows only records where both `isVerified` and `isPublished` are true. Admin users manage profiles from **Admin → Faculty**. Profile fields include name, designation, teaching/non-teaching category, department, subjects, qualifications, specialization, experience, joining year, professional bio, achievements, languages, optional professional email, ordering, featured status and profile photo.

Protected endpoints are `GET /api/admin/faculty`, `POST /api/admin/faculty`, `PATCH /api/admin/faculty/:id`, `DELETE /api/admin/faculty/:id`, and `GET /api/admin/faculty/:id/photo`. Photo upload uses multipart field `photo`, permits JPG/PNG/WEBP/GIF up to 5 MB, and checks the file signature. Public photos are served via `GET /api/faculty/:id/photo` only while a profile is verified and published; unverified and unpublished photos require an administrator session. A profile without a photograph uses an initials placeholder. Do not seed invented faculty data: add only school-verified details and images the school is authorized to publish.

## Admin features and document rules

- **Overview:** counts and latest enquiries/messages.
- **Enquiries:** guardian/student details, contact information, current status, Google Sheets sync state, manual sync retry.
- **Messages:** contact-form message list and follow-up status.
- **Faculty:** staff directory CRUD, details, image upload/removal, verification, publication state, featured ordering and search.
- **Notices:** create date/time-bound announcements, optional expiry and optional PDF, publish/hide, delete.
- **Admission documents:** upload a prospectus, admission form, fee structure, required-documents PDF, or other school information; publish/hide/delete each file.
- **Gallery:** upload JPG/PNG/WEBP/GIF images up to 8 MB, with title/category/caption; remove existing gallery records.
- **Settings:** change contact phone, WhatsApp phone, email, school address, and existing homepage text.
- **Password:** change the admin password. The backend uses an HTTP-only cookie; do not share admin access.

Faculty profile images are limited to JPG/PNG/WEBP/GIF up to 5 MB and validated by file signature. Their files are served through a public route only when the corresponding profile is verified and published, or through an authenticated admin route otherwise.

Documents are limited to valid PDFs (PDF signature checked) up to 15 MB. The project stores uploaded files on the backend local disk in `backend/uploads`. That is appropriate for local testing, but a hosted deployment needs durable persistent storage and backups; ephemeral server filesystems can lose uploads after redeployment. For a multi-instance production deployment, use object storage (for example, a school-approved S3-compatible provider) and update the storage adapter instead of relying on instance-local files.

## Production checklist

1. Rotate credentials from the original archive and create new database/admin/JWT/sheet secrets. Keep `.env`, `.jwt-secret`, `.admin-credentials`, user data, and Google secrets out of Git.
2. Verify CBSE affiliation number `2133424` and school code `71601` from official records before publishing the CBSE claim.
3. Check school phone/WhatsApp/email, maps URL, fee amounts, admission dates, and disclosure documents with the school office. Do not publish example/expired notices as current policy.
4. Secure the production MongoDB user, IP/network allow-list, backups, TLS/HTTPS, domain, and allowed CORS origins (`CLIENT_URL`).
5. Keep `COOKIE_SAME_SITE=lax` when frontend and API are same-site. For genuinely cross-site frontend/API hosts use HTTPS and configure the secure cookie setting as required; test login, refresh, and logout in the target browsers.
6. Enable Google Sheets sync and perform an end-to-end test. Restrict spreadsheet sharing because it contains personal contact information.
7. Use a persistent volume or external object storage for uploaded files, set a maximum upload size appropriate to the host, and back up documents and MongoDB.
8. Run `npm run check` from the project root in an environment with all dependencies installed. This runs backend syntax checks and the Vite production build.
9. Ensure the school has permission to publish all photos and student imagery. Obtain appropriate consent before publishing identifiable students.

## Build and serve a production frontend

```bash
npm run check
npm run build
```

For a single-origin deployment, configure `SERVE_CLIENT=true` for the backend after `frontend/dist` exists and deploy the backend plus the built frontend on the same origin. Alternatively, host the Vite frontend separately and set `VITE_API_BASE_URL` (and optionally `VITE_MEDIA_BASE_URL`) in the frontend build environment, and set the backend `CLIENT_URL` to the frontend origin. Test cookie-based admin authentication carefully when splitting origins.

## Included docs

- `docs/LOCAL-SETUP.md`: condensed local setup checklist.
- `docs/ADMIN-GUIDE.md`: day-to-day administrator guide.
- `docs/google-sheets-webhook.gs`: Google Apps Script webhook for enquiry sync.
- `docs/site-audit.md`: existing-site audit and items to verify before launch.

## Validation notes

Backend JavaScript syntax checks pass with `npm --prefix backend run check`. A dependency-backed Vite production build and live MongoDB/Google Sheets integration test require installing all packages and setting up external services in your environment; they should be completed before deployment. Do not describe the site as production-verified until that end-to-end testing is done.


## Production deployment

See [`docs/PRODUCTION-DEPLOYMENT.md`](docs/PRODUCTION-DEPLOYMENT.md) for the recommended low-cost hosting architecture, Cloudinary setup, environment variables, deployment steps, and production smoke tests.
