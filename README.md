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

Git keeps a history of changes on your computer, so you can see what changed and return to an earlier version. GitHub stores that history online. Netlify hosts the website and can publish updates whenever you push them to GitHub.

The project is already initialized in Git and pushed to a private GitHub repository: <https://github.com/abdullahlutfithayyil/abdullah-lutfi-portfolio>. Keeping the code private does not prevent the website from being public.

To publish it, sign in to Netlify, choose **Add new project** → **Import an existing project**, connect GitHub, and select `abdullah-lutfi-portfolio`. Keep the build command empty and the publish directory set to `.` (the existing `netlify.toml` specifies this). Netlify will give the site a public `netlify.app` address after deployment. No Netlify account is connected from this project yet.

After editing the website, save and publish changes with:

```powershell
git add .
git commit -m "Describe your change"
git push
```

`git add` selects files for the next checkpoint, `git commit` saves that checkpoint to your local history, and `git push` uploads it to GitHub. Netlify will automatically deploy the new version. You can add a custom domain later if you want one.

## Features

English and Arabic (RTL), dark and light themes, poster deck, filterable asymmetric grid, artwork lightbox with keyboard navigation, anonymous comments, and reduced-motion support.
