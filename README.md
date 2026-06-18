# Latzman Advisors AG website

A responsive static implementation of the supplied Figma design.

## Run locally

From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Use `http://localhost:8080/?skipIntro=1` to skip the opening logo transition during development.

## Files

- `index.html` — page structure and content
- `styles.css` — layout, responsive design, and animations
- `script.js` — intro transition, mobile navigation, reveals, sticky-image interaction, and enquiry form handling
- `assets/` — images extracted from the supplied Figma file

The enquiry form opens the visitor's email client addressed to `office@latzman.ch`; connect it to your preferred form backend before production deployment if server-side delivery is required.
