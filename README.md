# Minimal Personal Website

A clean, minimalist personal website focused on reading and writing practice.

## What is included

- Lightweight, single-page structure inspired by simple personal websites
- Reading tracker with local browser storage
- Writing practice tracker with:
  - total sessions
  - total words
  - total minutes
  - current streak
- JSON export and one-click reset for tracker data
- Security defaults:
  - strict Content Security Policy
  - external CSS/JS (no inline script/style)
  - secure link attributes (`rel="noopener noreferrer"`)
  - static host security headers in `_headers`

## Files

- `index.html` - semantic page structure
- `styles.css` - minimalist typography and layout
- `app.js` - trackers, validation, and local storage behavior
- `_headers` - security headers for Netlify-compatible hosts

## Customize quickly

1. Edit biography text in `index.html`.
2. Replace seed reading/writing lists in `app.js`:
   - `seedReading`
   - `seedFinished`
   - `seedWriting`
3. Update the email/social links in the footer.

## Local preview

Run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes on data

Tracker entries are saved in browser local storage (client-side only).  
Use **Export tracker data** regularly if you want backups.
