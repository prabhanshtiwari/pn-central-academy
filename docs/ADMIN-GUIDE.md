# Administrator guide

## Sign in and protect the account

Open `/admin` on the website and sign in with the administrator account configured during setup. Change the first-run password as soon as possible, use a unique password (12 or more characters), and keep credentials in a school-controlled password manager. Do not share the credentials file or place secrets in screenshots, source code, or shared spreadsheets.

## Dashboard tabs

- **Overview:** quick counts and latest enquiries.
- **Enquiries:** contact guardians, change each enquiry's status and check the Google Sheet status. Use **Retry sync** if it is Pending/Failed after fixing the integration.
- **Messages:** view public contact-form messages and mark them read/replied/closed.
- **Faculty:** create, edit and delete teacher and non-teaching staff profiles. Record designation, department/subjects, qualifications, specialization, professional experience, joining year, professional bio, achievements, languages, optional school email, profile photo, display order and featured status. A profile is public only when it is both marked **Verified by the school** and **Published**. Unverified/draft profiles and their photos are not publicly accessible. Publish only details and photographs that the school has checked and has permission to display.
- **Notices:** enter a clear title, full notice text, publication date/time, optional expiry, and an optional PDF circular. Uncheck Publish/keep it hidden for drafts. A notice appears publicly only after its publication time and while it has not expired.
- **Admission documents:** upload a PDF, title it accurately, choose Prospectus, Admission form, Fee structure, Required documents or Other, and write a brief description. Published PDFs appear at `/admission-resources`; hidden PDFs remain available only to authenticated admin endpoints.
- **Gallery:** upload school-approved campus photos. Add descriptive titles/captions. Do not upload private student records or identifiable student photos without permission.
- **Settings:** update school name, public page copy, telephone numbers, WhatsApp contact number, email, and address. Test `tel:`, `mailto:`, and WhatsApp links from a phone after changes.
- **Password:** change your password. If a password is lost, use the controlled database/account recovery process rather than adding a public password reset endpoint.

## Notices and PDF safety

Use dates carefully and check time zone before publishing a notice. Expiry must not be earlier than publication. Use searchable names such as `Admission Schedule 2026–27`. PDFs must be under 15 MB and have a valid PDF signature; images/Word files are not accepted by these document endpoints. Only mark documents Published when the school intends visitors to download them.

## Google Sheets status

MongoDB is the primary enquiry store. The Google Sheets status indicates whether the external Sheet was updated. **Synced** means the webhook returned success; **Pending/Failed** means setup or a network/service error remains. A Retry sync action is provided. The spreadsheet is personal data: restrict access, avoid sharing it publicly, and follow the school's retention policy.

## Faculty verification and privacy

The faculty directory is served from the MongoDB `Faculty` collection. Admin endpoints require an authenticated administrator. Only documents with `isVerified: true` and `isPublished: true` are returned publicly. Profile photo uploads accept JPG, PNG, WEBP or GIF up to 5 MB; the server checks image signatures instead of trusting the browser's MIME type. Replacing or deleting a profile also removes its old local photo where applicable. Treat the admin verification checkbox as a school approval step, not as automatic third-party credential verification. Do not publish private telephone numbers, home addresses, identity numbers, or unverified awards/qualifications.
