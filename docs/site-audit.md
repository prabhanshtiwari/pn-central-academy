# P.N. Central Academy — public website audit

**Reviewed:** 10 October 2026  
**Source:** https://www.pncentralacademy.com/  
**Scope:** Publicly visible page text and linked image/document endpoints. This is a functional-content audit, not a penetration test or a claim that the school has approved reuse of all assets.

## Key findings

| Priority | Finding | Evidence / affected page | Recommended action |
|---|---|---|---|
| P0 | The database connection credential has been shared in the chat context. | Project setup supplied by the requester. | Rotate the Atlas database-user password, use a least-privilege database user, restrict Network Access, and store the replacement only in the local ignored `.env` or hosting secret manager. |
| P1 | Mandatory-disclosure document rows are incomplete: row labels appear as `ccc` and `schh`, with no uploaded document links. | https://www.pncentralacademy.com/mandisclosure.php | Obtain current, self-attested signed documents from the school and publish readable PDFs with correct titles. Do not invent document names or treat the current page as complete compliance evidence. |
| P1 | The staff page currently says “COMING SOON”; the non-teaching staff endpoint returns 404. | https://www.pncentralacademy.com/teaching-staff.php and https://www.pncentralacademy.com/non-teaching-staff.php | Collect and verify current staff details, role/qualification data, publication consent and image permissions. Publish the directory only after school approval. |
| P1 | The fee page lists a downloadable fee-structure link, but the fee amounts are not exposed in its readable page text. | https://www.pncentralacademy.com/fees-structure.php | Upload the current-session fee schedule from the school office. Avoid estimated amounts and explain recurring/one-time charges and payment rules clearly. |
| P1 | Admission page lists prospectus/application download links, but their direct document URLs were not captured in the visible page content. | https://www.pncentralacademy.com/admisssion-Procedure.php | Obtain the current files from the school and confirm that download links work on mobile and desktop. |
| P1 | Infrastructure copy includes an infirmary passage mentioning two qualified nurses, round-the-clock coverage and “Dorm Parent”; this may not accurately describe the current school/site. | https://www.pncentralacademy.com/infrastructure.php | Have the school verify operational facilities and remove any text imported from another institution. The new facilities page intentionally avoids repeating these specific claims as facts. |
| P1 | Homepage/footer and other page contact text are inconsistent: the homepage footer uses `pncentralacademy0@gmail.com`, while the header/contact/disclosure pages use `pncentralacademy01@gmail.com`. | https://www.pncentralacademy.com/ and https://www.pncentralacademy.com/contact.php | Confirm the official inbox and standardise it across page headers, footers, disclosure and any enquiry acknowledgements. The redesign currently uses the address repeated on the header/contact/disclosure pages. |
| P2 | The home page repeats long school messaging and gallery labels such as “Image 4”; spelling/capitalisation is inconsistent. | https://www.pncentralacademy.com/ | Use a consistent component system, concise writing, descriptive image alt text, consistent navigation and responsive spacing. The revamp implements a new design system. |
| P2 | The original navigation includes a student corner with timetable/calendar items, but current downloadable files could not be verified. | https://www.pncentralacademy.com/ | Publish current, session-dated timetable and calendar PDFs only after school confirmation. The revamp adds a Student Corner and flags missing documents. |
| P2 | The live home page embeds a YouTube video and links to a Facebook profile. | https://www.pncentralacademy.com/ | Retain only school-specific destinations. The revamp uses the observed YouTube video and Facebook profile rather than generic platform homepages. |

## Content verified from the visible source

- School name: P.N. Central Academy.
- Publicly stated location: Mauadih, Saidabad, Uttar Pradesh 221508.
- Contact numbers shown across the site: 9793404694 and 8381978558 (spacing varies).
- Email shown on most pages: pncentralacademy01@gmail.com (the homepage footer has a conflicting typo/variant).
- Mandatory-disclosure page lists affiliation number `2133424`, school code `71601`, principal Dr. Neeta Mishra and qualification text `B.ed, MEd,C-TET`; the school must still verify the current accuracy of these details.
- Homepage identifies Mr. Santosh Tiwari as Director and Dr. Neeta Mishra as Principal.
- Public page topics include about/history messaging, vision and mission, infrastructure, admissions, fees, teaching staff, non-teaching staff, student corner/timetable/calendar, mandatory disclosure, photo/video galleries and contact.

## New project scope

The React app includes responsive pages for Home, About, History, Vision & Mission, Facilities, Admissions, Fee Structure, Staff, Student Corner, Photo Gallery, Video Gallery, Mandatory Disclosure and Contact. The Express API stores admissions enquiries and contact messages in MongoDB, provides a protected admin dashboard, allows approved gallery image uploads, and supports editing public contact/hero content. Fee amounts, documents and staff details intentionally remain unfilled where the source material is incomplete.

## Launch checklist

- [ ] Rotate the Atlas credential; create a restricted application database user and use hosting secret settings.
- [ ] Run `npm run assets:sync` from a network-enabled machine, then review `frontend/public/assets/site-assets.json`; resolve any asset errors.
- [ ] Obtain permission to reproduce the school’s photos, logo and documents, especially identifiable student images.
- [ ] Verify all contact numbers, the official email, affiliation and school codes, principal qualification and current facilities.
- [ ] Replace incomplete mandatory disclosure rows with current signed documents; confirm fee, admission, timetable and calendar files.
- [ ] Deploy over HTTPS and configure the exact frontend origin in `CLIENT_URL`. For a cross-site frontend/API deployment, set `COOKIE_SAME_SITE=none` and keep HTTPS enabled.
- [ ] Start backend once to generate the JWT secret and first admin account; securely retrieve `backend/.admin-credentials`, sign in at `/admin`, and change the generated password.
- [ ] Configure backups, logs, uptime monitoring and school-controlled email/SMS notifications before promising automated message alerts. This version stores submissions in MongoDB and does not send emails/SMS by default.
- [ ] Test enquiries, contact message, upload/delete, password change, navigation, mobile layout, keyboard navigation and screen-reader labels in staging.
