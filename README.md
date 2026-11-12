# The Divide — Free clean build

This is a clean, no-API-key version. It fetches public RSS feeds through a Netlify Function and presents headlines by broad publisher orientation. It does **not** use OpenAI, paid APIs, scrape full articles, or perform fact-checking.

## Replace the GitHub repository files
Upload/replace these files at the repository root:
- `index.html`
- `manifest.json`
- `netlify.toml`
- `sw.js`
- `netlify/functions/news.js` (folder path matters)

Remove old `ai.js` and any accidental folder named `In the filename box, enter: netlify...` if still present. Keep README.

## Netlify
The site must be connected to this GitHub repository. Build settings:
- Build command: blank
- Publish directory: `.`
- Functions directory: `netlify/functions`

Commit changes to `main`; Netlify should deploy automatically. Then open the site and tap Refresh headlines.

## Notes
RSS availability/CORS is handled server-side. Feeds can occasionally fail or change. Publisher orientation is an approximate editorial tendency and does not classify every article. Headlines are not fact-checks or endorsements.
