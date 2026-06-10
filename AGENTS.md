# SciCalc Pro — STEM-focused scientific web application

A pure frontend web application providing scientific calculation, function graphing, matrix operations, and unit conversion for engineering/physics students.

## Project
- **Stack**: Vanilla HTML/CSS/JS, math.js (CDN), Chart.js (CDN)
- **Entry point**: `index.html`
- **Deployment**: GitHub Pages

## Commands
- **Serve locally**: `npx serve .` or `python -m http.server 8080`
- **Lint**: None configured (pure frontend)
- **Test**: Manual browser testing

## Architecture
- `index.html` — main entry, single-page app shell
- `css/style.css` — all styles (dark/light theme via CSS variables)
- `js/` — JavaScript modules
  - `js/calculator.js` — expression evaluation engine (wraps math.js)
  - `js/grapher.js` — 2D function plotter (Chart.js-based)
  - `js/matrix.js` — matrix operations UI and logic
  - `js/converter.js` — unit conversion (physics/engineering)
  - `js/app.js` — main app controller, tab switching, theme
  - `js/constants.js` — physical/math constants reference

## Conventions
- ES module syntax (`import`/`export`) *not* used; scripts loaded via `<script>` tags in order of dependency.
- CSS uses custom properties (variables) for theming — dark/light mode.
- All numbers use `math.js` for precise evaluation; never `eval()`.
- Responsive: mobile-first with CSS Grid/Flexbox.

## Notes
- Deploy via GitHub Pages from `/docs` or root.
