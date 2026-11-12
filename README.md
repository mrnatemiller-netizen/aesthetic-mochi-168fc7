# The Divide AI / live build
## Upload
Upload all files and folders at repository root (include `netlify/functions/` and `netlify.toml`) and commit to main. Netlify Git deploy should detect functions.
## Configure AI (required)
Netlify dashboard → Site configuration → Environment variables → Add:
- `OPENAI_API_KEY` = your secret API key (never place it in index.html)
- optional `OPENAI_MODEL` = `gpt-4.1-mini`
Then trigger a new deploy.
OpenAI API billing/usage is separate from ChatGPT subscription. Keep API key private.
## What it does
- Netlify function pulls publisher RSS feeds (some publishers/proxies may block; failures returned in API)
- frontend clusters headlines using simple keyword similarity (approximate, not guaranteed same story)
- click per article “Summarize this article” or story “Compare perspectives”; AI only sees headline/source metadata, NOT article full text.
- AI headline summaries are deliberately labeled limited; for actual article summaries we need legitimate full text access.
