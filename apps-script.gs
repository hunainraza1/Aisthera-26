/**
 * Aisthera '26 registration intake.
 * Paste this into Extensions > Apps Script on your Google Sheet, then deploy
 * as a Web App (see SETUP.md for full steps).
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  // Write header row once, if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Submitted At',
      'College Name',
      'Event',
      'Registration Type',
      'Team Size',
      'Team Lead Phone',
      'Team Lead Email',
      'Participants (Name / College ID)',
    ]);
  }

  // Collect participant_N_name / participant_N_idnum pairs into one readable cell
  const participants = [];
  let i = 1;
  while (data['participant_' + i + '_name']) {
    const name = data['participant_' + i + '_name'];
    const idnum = data['participant_' + i + '_idnum'] || '';
    participants.push(name + ' (' + idnum + ')');
    i++;
  }

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.collegeName || '',
    data.eventName || '',
    data.regType || '',
    data.teamSize || (data.regType === 'Solo' ? 1 : ''),
    data.teamLeadPhone || '',
    data.teamLeadEmail || '',
    participants.join('; '),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput('Aisthera 26 registration endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
