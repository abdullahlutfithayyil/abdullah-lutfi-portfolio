# Abdullah Lutfi — Portfolio

A static portfolio built with plain HTML, CSS, and JavaScript. It has no framework and no build step.

## Preview and checks

The files in this folder are the website. When deploying, select this folder—the one containing `index.html`, `css/`, and `js/`—not its parent folder.

To preview it locally, install the small development tools and start the local server:

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. These tools are only for local preview and formatting; Netlify does not need them to build the site.

```bash
npm run check
```

## Edit the portfolio

| What                                 | Where            |
| ------------------------------------ | ---------------- |
| Projects, copy, socials, Arabic text | `js/data.js`     |
| Colours, type, layout                | `css/styles.css` |
| Behaviour                            | `js/app.js`      |

- The hero artwork is currently a gradient. To use an image, add `--hero-image: url("../assets/hero.jpg");` to the `.hero` rule in `css/styles.css`.
- Project artwork currently loads from the Framer CDN. To host it here, put files in `assets/work/` and update the matching `image` entries in `js/data.js`; local image paths should be returned directly by `imgUrl()` in `js/app.js`.
- The social preview image is served by the existing Figma site. Keep those services and URLs available, or replace them with image files you choose to host yourself.

The anonymous comments wall uses a Supabase function configured in `js/data.js`. The website is static, so comments require that separate service to stay available.

## Publish with GitHub and Netlify

Git keeps a history of changes on your computer, so you can see what changed and return to an earlier version. GitHub stores a copy of that history online. Netlify hosts the website and can publish updates whenever you push them to GitHub.

1. Install Git for Windows if `git` is not available in PowerShell. In PowerShell, go to this project folder and create the first saved version:

   ```powershell
   Set-Location "$HOME\OneDrive\Documents\Portfolio\abdullah-lutfi-portfolio\abdullah-lutfi-portfolio"
   git init -b main
   git add .
   git commit -m "Prepare portfolio for launch"
   ```

   `git add` selects the files for a checkpoint; `git commit` saves that checkpoint in your local history.

2. On GitHub, create a new repository. Private is fine—the published website can still be public. Leave the options to add a README, `.gitignore`, or license unchecked, because this folder already has project files.

3. Connect your local folder to the new GitHub repository. Replace the example URL with the repository URL GitHub shows you:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/abdullah-lutfi-portfolio.git
   git push -u origin main
   ```

   `git push` uploads your saved commits to GitHub.

4. In Netlify, choose **Add new project** and import the GitHub repository. The existing `netlify.toml` sets the publish directory to `.`; leave the build command empty. Netlify will give the site a public `netlify.app` address.

After future edits, save and publish them with:

```powershell
git add .
git commit -m "Describe your change"
git push
```

Netlify will automatically deploy the new version from GitHub. You can add a custom domain later if you want one.

## Features

English and Arabic (RTL), dark and light themes, poster deck, filterable asymmetric grid, artwork lightbox with keyboard navigation, anonymous comments, and reduced-motion support.
