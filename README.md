# Michelle Feliciano — Portfolio

Personal portfolio site. Plain HTML, CSS, and JavaScript — no frameworks, no build
step, no external dependencies.

**Live site:** https://michellefeliciano.github.io/

## Files

- `index.html` — page content and structure
- `404.html` — page shown for addresses that do not exist (GitHub Pages uses it automatically)
- `projects/` — one in-depth case-study page per project
- `styles.css` — design tokens, layout, light/dark theme
- `script.js` — theme toggle, mobile nav, active-link highlighting, motion (scroll reveals,
  progress bar, mockup tilt), the skills-across-projects matrix (built from `data-skills` on the
  project cards), the experience filter (built from `data-tags` on each role), and the contact form
- `favicon.svg`, `apple-touch-icon.png`, `social-preview.png`, `images/` — site icons, social preview image,
  screenshots (WebP with JPEG fallbacks, so pages load fast)
- `Michelle-Feliciano-Resume.pdf` — downloadable résumé, linked from the Contact section
- `sitemap.xml`, `robots.txt` — search-engine discovery

## Quality checks

Every push runs `.github/workflows/checks.yml`, which:

1. runs `scripts/check_site.py` to catch broken links, images, and `#anchors`, missing alt
   text, missing page metadata, invalid structured data (JSON-LD), and sitemap mismatches;
2. runs [Lighthouse](https://github.com/GoogleChrome/lighthouse) on every page and fails if
   performance drops below 75 (shared CI runners are noisy) or accessibility, best practices, or SEO drop below 95.

To run the first check locally: `python3 scripts/check_site.py`.
