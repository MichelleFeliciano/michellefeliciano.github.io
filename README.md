# Michelle Feliciano — Portfolio

A single-page personal portfolio. Plain HTML, CSS, and JavaScript — no build step,
no frameworks, no CDNs, no fonts or icons fetched from the network. It works
identically offline (double-click `index.html`) and online (any static host).

## Files

- `index.html` — page content and structure
- `styles.css` — design tokens, layout, light/dark theme, accessibility styles
- `script.js` — theme toggle, mobile nav, active-link highlighting, scroll reveal
- `favicon.svg` — tab icon (self-contained SVG, no external request)

## Run it locally

Double-click `index.html` — it works with no server. If you prefer viewing it
through a local server (identical result, just a different URL):

```bash
py -m http.server 5500
```

Then open `http://localhost:5500`.

## Editing your content

All the real content (name, education, skills, projects, experience) lives
directly in `index.html`, in plain readable HTML — search for the section
you want to change (`id="about"`, `id="projects"`, etc.) and edit the text.
No rebuild step is needed; just save and refresh the browser.

Note: your GPA, class rank, home address, and student ID were intentionally
left off the site for privacy. Your phone number was also left off — the
Contact section uses an email `mailto:` link instead, since a real contact
form would require a third-party backend service (which breaks the
"no external dependency" goal). Add your phone number back into
`index.html` yourself if you want it public.

## Hosting it for free on GitHub Pages

1. **Create a GitHub account** if you don't have one: https://github.com/signup

2. **Create a new repository** on GitHub (via the website): click the `+` →
   "New repository". Name it whatever you like (e.g. `portfolio`). Leave it
   public, and don't initialize it with a README (you already have one).

3. **Initialize git in this folder and make your first commit** — run these
   from inside this project folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   ```

4. **Connect it to the GitHub repo you created** (replace `YOUR-USERNAME` and
   `YOUR-REPO` with your actual GitHub username and repo name):

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git branch -M main
   git push -u origin main
   ```

   The first push will prompt you to sign in to GitHub in your browser (or
   ask for a token, depending on how git is configured on your machine).

5. **Turn on GitHub Pages:**
   - On GitHub, open your repository → **Settings** → **Pages** (left sidebar).
   - Under "Build and deployment" → "Source", choose **Deploy from a branch**.
   - Under "Branch", choose **main** and folder **/ (root)**, then **Save**.
   - Wait 1–2 minutes. GitHub will show you the live URL, typically:
     `https://YOUR-USERNAME.github.io/YOUR-REPO/`

6. **Future updates:** any time you edit `index.html`/`styles.css`/`script.js`,
   just run:

   ```bash
   git add .
   git commit -m "Update portfolio"
   git push
   ```

   GitHub Pages redeploys automatically within a minute or two of each push.

### Optional: use your GitHub username as the site's root URL

If you name the repository exactly `YOUR-USERNAME.github.io`, GitHub serves
it at `https://YOUR-USERNAME.github.io/` directly (no `/REPO-NAME/` in the
path). Everything else in the steps above is the same.
