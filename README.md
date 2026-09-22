# Aisthera '26 — Fest Site

A two-page static site for **Aisthera '26**, the inter-collegiate fest by Yenepoya School of Allied Health Sciences (Cogniverse Psychology Club). Includes an event walkthrough (`index.html`), and a separate registration page (`register.html`) that adapts to each event's participant requirements — solo, a fixed team size, or a range — and submits straight into a Google Sheet.

No build step, no framework — plain HTML/CSS/JS. Deploys as-is on Vercel.

## File structure

```
├── index.html         # about, event walkthrough, all 10 events + rules, general rules
├── register.html       # registration form (separate page)
├── style.css            # shared styling
├── script.js             # dynamic participant fields + form submission (register.html only)
├── config.js              # <- paste your Google Sheet endpoint URL here
├── apps-script.gs          # paste into Google Sheets > Extensions > Apps Script
├── vercel.json
├── SETUP.md                # how to connect the Google Sheet
└── README.md
```

## 1. Push to GitHub

```bash
cd aisthera-site
git init
git add .
git commit -m "Aisthera '26 fest site"
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

## 3. Connect registrations to a Google Sheet

Follow **[SETUP.md](./SETUP.md)** — takes about 5 minutes. Until you do this, the form will show a friendly "not connected yet" message instead of failing silently.

## Per-event participant counts (already wired into the form)

| Event | Size |
|---|---|
| Morphe — Fashion Show | 8–12 (team) |
| Kenesia — Group Dance | 5–8 (team) |
| T-Shirt Painting | 1 (individual) |
| Meme Making | 1 (individual) |
| Quiz | 2 (fixed team) |
| Treasure Hunt | 3 (fixed team) |
| Debate | 2 (fixed team) |
| Dioptra — Photography | 1 (individual only) |
| Diēgēsis — Short Film | 4–6 (team) |
| Doxa — Reel Making | 1–2 (individual or pair) |

Picking an event on the registration page automatically shows the right number of participant fields (or a size selector, for events with a range).

## Editing content later

- **Event details / rules / wording** → edit the relevant section in `index.html`.
- **Registration options / team sizes** → edit the `<option>` tags in `register.html` (each carries `data-fixed-size`, or `data-min`/`data-max` for a range).
- **Colors / fonts** → `style.css` (CSS variables at the top).
- **Form logic** → `script.js`.

Push any change to `main` and Vercel redeploys automatically.
