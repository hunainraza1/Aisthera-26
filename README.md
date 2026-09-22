# Aisthera '26 — Registration Site

A single-page static site for **Aisthera '26**, the inter-collegiate fest by Yenepoya School of Allied Health Sciences (Cogniverse Psychology Club). Includes an event walkthrough, all 10 events with rules, general fest rules, and a registration form that supports **solo or team registrations (up to 8 members)**, submitting straight into a Google Sheet.

No build step, no framework — plain HTML/CSS/JS. Deploys as-is on Vercel.

## File structure

```
├── index.html        # all page content (about, events, rules, form)
├── style.css          # styling
├── script.js          # dynamic participant fields + form submission
├── config.js           # <- paste your Google Sheet endpoint URL here
├── apps-script.gs      # paste into Google Sheets > Extensions > Apps Script
├── vercel.json
├── SETUP.md            # how to connect the Google Sheet
└── README.md
```

## 1. Push to GitHub

```bash
cd aisthera-site
git init
git add .
git commit -m "Aisthera '26 registration site"
gh repo create aisthera-26 --public --source=. --push
```

(No `gh` CLI? Create an empty repo on github.com, then:)

```bash
git remote add origin https://github.com/<your-username>/aisthera-26.git
git branch -M main
git push -u origin main
```

## 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import the `aisthera-26` repo.
3. Framework preset: **Other** (no build needed — leave build command and output directory blank).
4. Click **Deploy**.

You'll get a live URL like `aisthera-26.vercel.app` in under a minute. Every push to `main` auto-redeploys.

Want a cleaner name? In the Vercel project settings you can add any free `*.vercel.app` subdomain you like, or connect a real domain later if you buy one — no code changes needed either way.

## 3. Connect registrations to a Google Sheet

Follow **[SETUP.md](./SETUP.md)** — takes about 5 minutes. Until you do this, the form will show a friendly "not connected yet" message instead of failing silently.

## Editing content later

- **Event details / rules / wording** → edit the relevant section in `index.html`.
- **Colors / fonts** → `style.css` (CSS variables at the top).
- **Form fields or logic** → `script.js`.

Push any change to `main` and Vercel redeploys automatically.
