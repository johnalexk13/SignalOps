# SignalOps: Market & Community Intelligence Platform

This workspace contains the IBM Netezza stakeholder dashboard for:

- competitive intelligence
- community intelligence
- content and PMM suggestion workflows
- editable source, keyword, and platform management

It can run in two modes:

- `Local live mode`: served by `server.mjs` on `http://localhost:3000`
- `GitHub Pages snapshot mode`: served as a static site for stakeholders

## Project files

- `index.html`: dashboard shell
- `styles.css`: layout and visual system
- `dashboard.js`: rendering, refresh, workspace switching, and data loading
- `server.mjs`: local server for localhost use
- `workspace-intelligence.mjs`: live payload generation
- `build/generate-stakeholder-snapshot.mjs`: builds the GitHub-shareable snapshot JSON
- `data/workspace-intelligence.json`: generated static snapshot used on GitHub Pages
- `Launch Netezza Dashboard.command`: one-click local launcher

## How the hosted GitHub version works

When the dashboard runs on GitHub Pages, there is no Node server and no `/api/workspace-intelligence` endpoint.

To support that, the frontend now behaves like this:

1. It first tries the live local API.
2. If that API is unavailable, it falls back to `./data/workspace-intelligence.json`.
3. That JSON file is the stakeholder snapshot you generate before publishing.

This means:

- `localhost` can still use the richer local/live flow
- GitHub Pages can show a stable stakeholder-ready snapshot
- stakeholders do not need Node, Terminal, or localhost access

## Local run

From this folder:

```bash
node server.mjs
```

Then open:

```text
http://localhost:3000
```

Or use:

- `Launch Netezza Dashboard.command`

## Generate the stakeholder snapshot

Before publishing to GitHub, generate a fresh snapshot:

```bash
node build/generate-stakeholder-snapshot.mjs
```

Or:

```bash
npm run snapshot
```

This updates:

- `data/workspace-intelligence.json`

## Publish to GitHub Pages

1. Create a new GitHub repository.
2. Upload or push this project folder to the repository.
3. Generate a fresh snapshot before pushing:

```bash
node build/generate-stakeholder-snapshot.mjs
```

4. In GitHub, open:
   `Settings` -> `Pages`
5. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
6. Save the settings.
7. GitHub will publish the site and give you a public Pages URL.

## How to refresh stakeholder content later

Whenever you want stakeholders to see newer insights:

1. Run:

```bash
node build/generate-stakeholder-snapshot.mjs
```

2. Commit the updated `data/workspace-intelligence.json`
3. Push to GitHub

That republishes the hosted snapshot with the latest generated content.

## Important note about freshness

The GitHub-hosted version is a published snapshot, not a true server-backed live app.

That means:

- the UI still auto-refreshes in the browser
- but the hosted content only changes when you regenerate and push a new snapshot

For fully live stakeholder sharing, Netlify or another Node/serverless host would still be the better fit.

## Recommended sharing model

Use:

- `GitHub Pages` for easy stakeholder viewing and broad sharing
- `localhost` for your own working version
- `Netlify` later if you want always-live hosted data refresh

## Better real-time hosting alternative: Render

If you need the live API-driven version instead of a static snapshot, `Render` is the simplest alternative to Netlify for this project.

Why Render fits this app:

- it runs `server.mjs` as a real Node web service
- it supports public shareable URLs
- it preserves `/api/workspace-intelligence` and `/api/market-signals`
- it does not require converting this app into GitHub Pages or Cloudflare Workers first

Important free-plan note:

- Render Free web services spin down after 15 minutes of inactivity and can take about a minute to wake back up

That is usually acceptable for stakeholder review, but it is not ideal for a polished production experience.
