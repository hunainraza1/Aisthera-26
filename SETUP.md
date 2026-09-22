# Connecting registrations to a Google Sheet

This takes about 5 minutes. You only do this once.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Rename it something like **Aisthera '26 Registrations**.

## 2. Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any starter code in the editor.
3. Open `apps-script.gs` from this repo, copy its entire contents, and paste it into the Apps Script editor.
4. Click the **Save** icon (or Ctrl/Cmd+S). Name the project (e.g. "Aisthera Registration Intake").

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: Aisthera registration endpoint
   - **Execute as**: Me (your account)
   - **Who has access**: **Anyone** (this is required — the website needs to reach it without you being logged in)
4. Click **Deploy**.
5. Google will ask you to authorize the script — click through the consent screens (click "Advanced" → "Go to [project name] (unsafe)" if it warns you; this is your own script, it's safe).
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Plug the URL into the site

1. Open `config.js` in this repo.
2. Paste the URL between the quotes:
   ```js
   const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Save, commit, and push — Vercel will redeploy automatically (see `README.md`).

## 5. Test it

1. Open your live site, fill out the registration form, and submit.
2. Check the Google Sheet — a new row should appear within a few seconds.
3. If nothing shows up: re-open Apps Script, go to **Executions** (left sidebar) to see the error log, and double check "Who has access" is set to **Anyone**.

## Notes

- Every submission becomes a new row automatically — headers are added the first time.
- If you ever change the script (`apps-script.gs`), you need to **Deploy → Manage deployments → Edit (pencil icon) → New version → Deploy** for changes to go live — saving alone isn't enough.
- Only you (the Sheet owner) can see the responses unless you share the Sheet.
