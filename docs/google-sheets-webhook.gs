/**
 * P.N. Central Academy enquiry sync endpoint.
 * 1) Create a dedicated Google Sheet and copy its ID.
 * 2) In Apps Script > Project Settings > Script properties, set:
 *      SHEET_ID = the Google Sheet ID
 *      SHEET_NAME = Enquiries (or your chosen tab name)
 *      WEBHOOK_SECRET = a long random string shared with backend/.env
 * 3) Deploy as Web app, execute as your account, access: Anyone.
 *    The URL is protected by WEBHOOK_SECRET; keep it in backend/.env only.
 * 4) Paste the deployed /exec URL into GOOGLE_SHEETS_WEBHOOK_URL.
 *
 * Rows are upserted using the MongoDB enquiry ID in column A; retrying a sync
 * updates the existing row instead of duplicating an enquiry.
 */
function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty('WEBHOOK_SECRET') || '';
    const sheetId = properties.getProperty('SHEET_ID') || '';
    const sheetName = properties.getProperty('SHEET_NAME') || 'Enquiries';

    if (!expectedSecret || !sheetId || !payload.secret || payload.secret !== expectedSecret) {
      return json_({ success: false, message: 'Unauthorised or incomplete Google Sheets configuration.' });
    }
    if (payload.event !== 'admission-enquiry' || !payload.record || !payload.record.id) {
      return json_({ success: false, message: 'Unsupported event or missing enquiry ID.' });
    }

    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName)
      || SpreadsheetApp.openById(sheetId).insertSheet(sheetName);
    const headers = [
      'Enquiry ID', 'Submitted At', 'Parent / Guardian', 'Student', 'Phone',
      'Email', 'Address', 'Class Interested', 'Message', 'Status', 'Consent Accepted At',
      'Last Synced At'
    ];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    } else {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }

    const record = payload.record;
    const now = new Date().toISOString();
    const values = [[
      cell_(record.id), cell_(record.submittedAt), cell_(record.guardianName),
      cell_(record.studentName), cell_(record.phone), cell_(record.email),
      cell_(record.address), cell_(record.classInterested), cell_(record.message),
      cell_(record.status), cell_(record.consentAcceptedAt), cell_(now)
    ]];

    // First column is the stable unique ID. Find and update an existing row on retry.
    const lastRow = sheet.getLastRow();
    let rowNumber = 0;
    if (lastRow > 1) {
      const matches = sheet.getRange(2, 1, lastRow - 1, 1)
        .createTextFinder(String(record.id)).matchEntireCell(true).findNext();
      if (matches) rowNumber = matches.getRow();
    }
    if (rowNumber) {
      sheet.getRange(rowNumber, 1, 1, headers.length).setValues(values);
    } else {
      sheet.appendRow(values[0]);
    }

    return json_({ success: true, message: 'Enquiry synchronised.' });
  } catch (error) {
    console.error('Enquiry sheet sync failed:', error && error.message ? error.message : error);
    return json_({ success: false, message: 'Google Sheets could not process the enquiry.' });
  }
}

function cell_(value) {
  const text = value == null ? '' : String(value).slice(0, 8000);
  // Prefix formula-like strings so a submitted name/message is always literal text.
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
