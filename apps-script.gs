/**
 * Aisthera '26 registration intake.
 * Paste this into Extensions > Apps Script on your Google Sheet, then deploy
 * as a Web App (see SETUP.md for full steps). After pasting this version,
 * use Deploy > Manage deployments > Edit > New version, and approve the
 * Google Drive permission when asked (payment proofs are saved to Drive).
 */
const PROOF_FOLDER_NAME = 'Aisthera 26 Payment Proofs';

function getProofFolder_() {
  const it = DriveApp.getFoldersByName(PROOF_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PROOF_FOLDER_NAME);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  // Write header row once, if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Submitted At',
      'College Name',
      'Event',
      'Team Size',
      'Team Lead Phone',
      'College Student Representative',
      'Representative Phone',
      'Participants (Name / College ID)',
      'Payment Proofs',
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

  // Save each payment proof to Drive and keep its link
  const proofLinks = [];
  const proofs = data.proofs || [];
  if (proofs.length) {
    const folder = getProofFolder_();
    const stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd-HHmmss');
    const safe = function (s) { return String(s || '').replace(/[^\w\-]+/g, '_').slice(0, 40); };
    proofs.forEach(function (p, idx) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(p.data),
        p.type,
        safe(data.collegeName) + '_' + safe(data.eventName) + '_P' + (idx + 1) + '_' + stamp + '_' + safe(p.name)
      );
      proofLinks.push('P' + (idx + 1) + ': ' + folder.createFile(blob).getUrl());
    });
  }

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.collegeName || '',
    data.eventName || '',
    data.teamSize || '',
    data.teamLeadPhone || '',
    data.repName || '',
    data.repPhone || '',
    participants.join('; '),
    proofLinks.join('\n'),
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
