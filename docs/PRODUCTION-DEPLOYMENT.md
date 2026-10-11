# Production deployment — P.N. Central Academy

This project is a React/Vite frontend + Express/Mongoose API. Existing images in `frontend/public/assets` are static frontend assets and should remain there: Vite copies them into `dist/assets` at build time. Use paths such as `/assets/hero-campus.png` (not a local filesystem path). The API stores editable site content, enquiries, messages, faculty, notices, and document metadata in MongoDB.

## Recommended low-cost architecture

- **Frontend:** Vercel or Cloudflare Pages (free static hosting, custom domain + HTTPS).
- **API:** Render web service (simple Node hosting). The free instance can sleep and has an ephemeral filesystem; use a paid persistent disk if you need uploaded PDFs and legacy local uploads to survive restarts. A low-cost always-on Node host with a persistent volume is the least surprising option for this app.
- **Database:** MongoDB Atlas free/shared tier where currently available. Create a dedicated least-privilege database user and restrict network access; avoid `0.0.0.0/0` unless there is no practical alternative.
- **Images uploaded through admin:** Cloudinary free tier, optional. This code uses signed server-side uploads for gallery and faculty images when all three Cloudinary variables are configured. If not configured, uploads fall back to local disk. **Notice/admission PDFs still use local disk**, so persistent storage is required for those files unless you extend the document storage adapter to object storage.
- **Domain:** map the root/www domain to the frontend provider, and use a separate API subdomain (for example `api.example.com`) for the backend. HTTPS is required.

Free tiers and limits change; verify current quotas, sleeping behavior, data retention, and custom-domain terms before launch. Free hosting is not a guarantee of production-grade uptime or backup.

## Before deployment — security

1. The source archive previously contained local `.env` and JWT-secret files. They are intentionally not included in this cleaned delivery. **If the Atlas password or any token in that file was ever real/shared, rotate it now** and invalidate old secrets. Do not put secrets in Vite variables or commit `.env` files.
2. Create `backend/.env` locally from `backend/.env.example`; for hosted deployment, set the same values in the host's secret/environment-variable dashboard.
3. Use a unique `ADMIN_EMAIL` and a long random `ADMIN_PASSWORD` (at least 12 characters). Configure these before the first backend boot. If the first admin was already created, changing `ADMIN_PASSWORD` does not reset its password; log in and use the admin password-change feature.
4. Set a new random `JWT_SECRET` of at least 32 characters. Never commit it. Hosted instances should use an environment variable because their filesystem may be read-only/ephemeral.
5. Use a dedicated MongoDB database user, database-specific permissions, backups, and an Atlas network policy.
6. Use the correct `CLIENT_URL` (exact origin, no path) and `COOKIE_SAME_SITE=none` only when frontend/API are cross-site. Cross-site cookies require HTTPS. For same-site origins, `lax` is generally simpler.

## Backend environment

Required:

```dotenv
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<restricted-user>:<encoded-password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret-at-least-32-characters>
ADMIN_EMAIL=<school-controlled-admin-email>
ADMIN_PASSWORD=<unique-password-at-least-12-characters>
CLIENT_URL=https://www.example.com,https://example.com
COOKIE_SAME_SITE=none
TRUST_PROXY=true
SERVE_CLIENT=false
```

Optional Cloudinary image storage:

```dotenv
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

Never prefix server secrets with `VITE_`; those variables are embedded in the public frontend bundle. `TRUST_PROXY=true` is appropriate behind a trusted hosting proxy; if your host uses a different proxy topology, follow its documentation.

## Frontend environment

Set the production API URL when frontend and backend are deployed separately:

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
VITE_MEDIA_BASE_URL=https://api.example.com
```

Cloudinary image URLs are absolute and do not require `VITE_MEDIA_BASE_URL`. Existing `/uploads/...` URLs need the API media base. Build the frontend with `npm run build` from the project root, or use `npm --prefix frontend run build`.

## Deploy steps

1. Push the cleaned project to a private Git repository; confirm `.env`, `.jwt-secret`, `.admin-credentials`, `node_modules`, and local data dumps are excluded.
2. Provision Atlas and add the backend host's outbound access according to the current Atlas/host instructions. Set the backend environment variables in the hosting dashboard.
3. Deploy the `backend` directory as a Node web service. Build/install command: `npm ci`; start command: `npm start` (or from monorepo root use `npm --prefix backend ci` and `npm --prefix backend start`, depending on host root-directory support). The app listens on `process.env.PORT` and connects to MongoDB before accepting requests.
4. Configure the frontend project with root directory `frontend`, build command `npm ci && npm run build`, output directory `dist`, and the `VITE_*` variables above.
5. Add frontend and API custom domains, wait for TLS certificates, and set `CLIENT_URL` to the exact frontend origins. Redeploy the backend after changing environment variables.
6. On first startup, bootstrap creates the configured admin account. If `ADMIN_PASSWORD` was not supplied, a one-time password is written to `backend/.admin-credentials` on a writable local disk; do not rely on that mechanism on an ephemeral host. Set the admin password before first deployment.
7. In Cloudinary, keep the API secret server-side only. Uploads are signed by the API. Enable only the image upload features needed, set account usage alerts, and verify usage limits.
8. If the project already has database records pointing to `/uploads/...`, copy the referenced files to persistent storage or migrate them and update their MongoDB URLs. The files in `frontend/public/assets` are unrelated static assets and are deployed with the frontend automatically.

## Production smoke test checklist

- `GET https://api.example.com/api/health` returns success.
- Public pages load on mobile and desktop; check all logo, hero, gallery and site-mirror images.
- Admin login works; invalid credentials are rejected and login rate limiting is active.
- Admin can change password, update public settings, and manage notices, admission documents, gallery and faculty.
- Public faculty list contains only verified + published faculty.
- Submit a contact message and admission enquiry; confirm each is stored in MongoDB and visible in the admin dashboard.
- Test PDF upload/download, faculty photo upload, gallery upload/delete, and verify media survives an API restart/redeploy.
- Verify CORS rejects unlisted origins; all production traffic uses HTTPS; browser cookies are HttpOnly/Secure.
- Configure database backups, log retention, uptime monitoring, and a school-controlled process for responding to enquiries.
- Verify the school has permission to publish staff/student images and all public contact/disclosure/fee details are current.

## Known operational caveats

- Cloudinary integration covers **gallery and faculty images only**. PDF notices/admission documents and existing `/uploads` media use local disk. Do not deploy those workflows on an ephemeral filesystem unless you first migrate them to durable storage.
- Enquiry/contact records are persisted in MongoDB, but email/SMS notifications are not sent by default. Google Sheets sync is optional and separately configured.
- Do not publish unverified staff profiles or incomplete disclosure/fee documents. Content accuracy and image consent must be approved by the school.
