# Local Source Setup

This workspace now auto-loads [relevant-sources.json](C:\Users\JohnAlexander\OneDrive - IBM\Documents\New project\config\relevant-sources.json) from the `config` folder inside `netlify/functions/live-signals.js`.

What is ready now:
- Additional Google News live feeds for Databricks, Snowflake, Amazon Redshift, BigQuery, and Teradata.
- Extra competitor-specific searches for SQL, migration, AI, pricing, and Vantage topics.

What still needs your real endpoint:
- The local source pack now points to internal Netlify function proxies like `/.netlify/functions/linkedin-databricks`.
- Each of those internal proxies needs its upstream URL env var set.
- Use [proxy-env-template.txt](C:\Users\JohnAlexander\OneDrive - IBM\Documents\New project\config\proxy-env-template.txt) for the exact variable names.

Expected JSON shape for each proxy response:

```json
{
  "items": [
    {
      "title": "Signal title",
      "summary": "Short summary of the signal",
      "url": "https://source-link.example.com/post",
      "publishedAt": "2026-04-08T12:30:00Z"
    }
  ]
}
```

If you want, the next step can be wiring real proxy endpoints for LinkedIn, G2, TrustRadius, and website-diff monitoring.

Internal proxy endpoints now included:
- `/.netlify/functions/linkedin-databricks`
- `/.netlify/functions/linkedin-snowflake`
- `/.netlify/functions/g2-databricks`
- `/.netlify/functions/g2-redshift`
- `/.netlify/functions/trustradius-bigquery`
- `/.netlify/functions/trustradius-teradata`
- `/.netlify/functions/webdiff-databricks`
- `/.netlify/functions/webdiff-snowflake-pricing`
