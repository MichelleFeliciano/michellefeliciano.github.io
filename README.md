# Michelle Feliciano — Portfolio

Personal portfolio site. Plain HTML, CSS, and JavaScript — no frameworks, no build
step, no external dependencies.

**Live site:** https://michellefeliciano.github.io/

## Files

- `index.html` — page content and structure
- `projects/` — one in-depth case-study page per project
- `styles.css` — design tokens, layout, light/dark theme
- `script.js` — theme toggle, mobile nav, active-link highlighting, scroll reveal, and the
  skills-across-projects matrix (built from the `data-skills` attributes on the project cards)
- `favicon.svg`, `social-preview.png`, `images/` — site icon, social preview image, screenshots
- `Michelle-Feliciano-Resume.pdf` — downloadable résumé, linked from the Contact section
- `sitemap.xml`, `robots.txt` — search-engine discovery

## Quality checks

Every push runs `.github/workflows/checks.yml`, which:

1. runs `scripts/check_site.py` to catch broken links, images, and `#anchors`, missing alt
   text, missing page metadata, invalid structured data (JSON-LD), and sitemap mismatches;
2. runs [Lighthouse](https://github.com/GoogleChrome/lighthouse) on every page and fails if
   performance drops below 90 or accessibility, best practices, or SEO drop below 95.

To run the first check locally: `python3 scripts/check_site.py`.
