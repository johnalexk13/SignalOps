import { mkdir, readFile, writeFile } from "node:fs/promises";

const FETCH_TIMEOUT_MS = 9000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const SNAPSHOT_FILE_URL = new URL("./.cache/market-signals.json", import.meta.url);

let cache = {
  expiresAt: 0,
  payload: null,
};

const LIVE_MARKET_SOURCES = [
  { id: "db-linkedin", kind: "html", parser: "linkedin", competitor: "Databricks", group: "social", sourceLabel: "LinkedIn", sourceBadge: "LINKEDIN", sourceUrl: "https://www.linkedin.com/company/databricks" },
  { id: "sf-linkedin", kind: "html", parser: "linkedin", competitor: "Snowflake", group: "social", sourceLabel: "LinkedIn", sourceBadge: "LINKEDIN", sourceUrl: "https://www.linkedin.com/company/snowflake-computing" },
  { id: "gc-linkedin", kind: "html", parser: "linkedin", competitor: "Google BigQuery", group: "social", sourceLabel: "LinkedIn", sourceBadge: "LINKEDIN", sourceUrl: "https://www.linkedin.com/showcase/google-cloud/" },
  { id: "az-linkedin", kind: "html", parser: "linkedin", competitor: "Azure Synapse", group: "social", sourceLabel: "LinkedIn", sourceBadge: "LINKEDIN", sourceUrl: "https://www.linkedin.com/showcase/microsoft-azure/" },
  { id: "td-linkedin", kind: "html", parser: "linkedin", competitor: "Teradata", group: "social", sourceLabel: "LinkedIn", sourceBadge: "LINKEDIN", sourceUrl: "https://www.linkedin.com/company/teradata" },

  { id: "db-g2", kind: "html", parser: "g2", competitor: "Databricks", group: "reviews", sourceLabel: "G2", sourceBadge: "G2", sourceUrl: "https://www.g2.com/products/databricks-data-intelligence-platform/reviews" },
  { id: "db-tr", kind: "html", parser: "trustradius", competitor: "Databricks", group: "reviews", sourceLabel: "TrustRadius", sourceBadge: "TRUSTRADIUS", sourceUrl: "https://www.trustradius.com/products/databricks-data-intelligence-platform/reviews" },
  { id: "sf-g2", kind: "html", parser: "g2", competitor: "Snowflake", group: "reviews", sourceLabel: "G2", sourceBadge: "G2", sourceUrl: "https://www.g2.com/products/snowflake/reviews" },
  { id: "sf-tr", kind: "html", parser: "trustradius", competitor: "Snowflake", group: "reviews", sourceLabel: "TrustRadius", sourceBadge: "TRUSTRADIUS", sourceUrl: "https://www.trustradius.com/products/snowflake/reviews" },
  { id: "rs-g2", kind: "html", parser: "g2", competitor: "Amazon Redshift", group: "reviews", sourceLabel: "G2", sourceBadge: "G2", sourceUrl: "https://www.g2.com/products/amazon-redshift/reviews" },
  { id: "bq-g2", kind: "html", parser: "g2", competitor: "Google BigQuery", group: "reviews", sourceLabel: "G2", sourceBadge: "G2", sourceUrl: "https://www.g2.com/products/google-bigquery/reviews" },
  { id: "bq-tr", kind: "html", parser: "trustradius", competitor: "Google BigQuery", group: "reviews", sourceLabel: "TrustRadius", sourceBadge: "TRUSTRADIUS", sourceUrl: "https://www.trustradius.com/products/google-bigquery/reviews" },
  { id: "az-g2", kind: "html", parser: "g2", competitor: "Azure Synapse", group: "reviews", sourceLabel: "G2", sourceBadge: "G2", sourceUrl: "https://www.g2.com/products/microsoft-azure-synapse-analytics/reviews" },
  { id: "az-tr", kind: "html", parser: "trustradius", competitor: "Azure Synapse", group: "reviews", sourceLabel: "TrustRadius", sourceBadge: "TRUSTRADIUS", sourceUrl: "https://www.trustradius.com/products/azure-synapse-analytics/reviews/all" },
  { id: "rs-tr", kind: "html", parser: "trustradius", competitor: "Amazon Redshift", group: "reviews", sourceLabel: "TrustRadius", sourceBadge: "TRUSTRADIUS", sourceUrl: "https://www.trustradius.com/products/redshift/reviews" },
  { id: "td-g2", kind: "html", parser: "g2", competitor: "Teradata", group: "reviews", sourceLabel: "G2", sourceBadge: "G2", sourceUrl: "https://www.g2.com/products/teradata-vantage/reviews" },
  { id: "td-tr", kind: "html", parser: "trustradius", competitor: "Teradata", group: "reviews", sourceLabel: "TrustRadius", sourceBadge: "TRUSTRADIUS", sourceUrl: "https://www.trustradius.com/products/teradata-vantage/reviews" },

  { id: "db-blog", kind: "feed", parser: "feed", competitor: "Databricks", group: "blog", sourceLabel: "Blog", sourceBadge: "BLOG", sourceUrl: "https://docs.databricks.com/aws/en/feed.xml" },
  { id: "sf-blog", kind: "feed", parser: "feed", competitor: "Snowflake", group: "blog", sourceLabel: "Blog", sourceBadge: "BLOG", sourceUrl: "https://www.snowflake.com/blog/feed/" },
  { id: "rs-blog", kind: "feed", parser: "feed", competitor: "Amazon Redshift", group: "blog", sourceLabel: "Blog", sourceBadge: "BLOG", sourceUrl: "https://aws.amazon.com/blogs/big-data/feed/", matchAny: ["redshift"] },
  { id: "bq-blog", kind: "feed", parser: "feed", competitor: "Google BigQuery", group: "blog", sourceLabel: "Blog", sourceBadge: "BLOG", sourceUrl: "https://cloud.google.com/blog/products/data-analytics/rss/", matchAny: ["bigquery", "analytics"] },
  { id: "td-blog", kind: "feed", parser: "feed", competitor: "Teradata", group: "blog", sourceLabel: "Blog", sourceBadge: "BLOG", sourceUrl: "https://www.teradata.com/Blogs/RSS" },

  { id: "db-web", kind: "html", parser: "website", competitor: "Databricks", group: "website", sourceLabel: "Website", sourceBadge: "WEBSITE", sourceUrl: "https://docs.databricks.com/sql/index.html" },
  { id: "sf-web", kind: "html", parser: "website", competitor: "Snowflake", group: "website", sourceLabel: "Website", sourceBadge: "WEBSITE", sourceUrl: "https://www.snowflake.com/en/migrate-to-the-cloud/" },
  { id: "bq-web", kind: "html", parser: "website", competitor: "Google BigQuery", group: "website", sourceLabel: "Website", sourceBadge: "WEBSITE", sourceUrl: "https://cloud.google.com/bigquery" },
  { id: "az-web", kind: "html", parser: "website", competitor: "Azure Synapse", group: "website", sourceLabel: "Website", sourceBadge: "WEBSITE", sourceUrl: "https://azure.microsoft.com/en-us/products/synapse-analytics/" },
  { id: "rs-web", kind: "html", parser: "website", competitor: "Amazon Redshift", group: "website", sourceLabel: "Website", sourceBadge: "WEBSITE", sourceUrl: "https://aws.amazon.com/redshift/features/" },
  { id: "td-web", kind: "html", parser: "website", competitor: "Teradata", group: "website", sourceLabel: "Website", sourceBadge: "WEBSITE", sourceUrl: "https://www.teradata.com/platform" },
];

const FALLBACK_MARKET_SIGNALS = [
  makeFallback("databricks", "Databricks", "social", "LinkedIn", "LINKEDIN", "https://www.linkedin.com/company/databricks", "Open LinkedIn", "Databricks is actively telling the market that warehouse modernization value comes from consolidation, governed AI, and faster legacy decommissioning. That is a direct strike at Netezza-style enterprise estates.", "2026-04-18T12:00:00Z"),
  makeFallback("databricks-web", "Databricks", "website", "Website", "WEBSITE", "https://docs.databricks.com/aws/en/release-notes/product/2026/april", "Open release notes", "Databricks is expanding migration connectors and AI governance in the same release wave. Netezza should treat this as a coordinated modernization plus trust narrative, not a random feature drop.", "2026-04-17T10:00:00Z"),
  makeFallback("databricks-g2", "Databricks", "reviews", "G2", "G2", "https://www.g2.com/products/databricks-data-intelligence-platform/reviews", "View G2", "Databricks reviews still celebrate breadth and collaboration, but complexity and price keep surfacing. Netezza should hit ease, operating clarity, and lower architecture burden much harder.", "2026-04-16T10:00:00Z"),
  makeFallback("snowflake", "Snowflake", "social", "LinkedIn", "LINKEDIN", "https://www.linkedin.com/company/snowflake-computing", "Open LinkedIn", "Snowflake keeps using customer proof to turn migration and enterprise AI into an ease-of-adoption story. That threatens Netezza whenever buyers want cloud progress without operational friction.", "2026-04-18T08:30:00Z"),
  makeFallback("snowflake-g2", "Snowflake", "reviews", "G2", "G2", "https://www.g2.com/products/snowflake/reviews", "View G2", "Snowflake's review motion still combines speed and usability with cost pressure. Netezza should press on predictable economics before Snowflake's UX halo dominates the deal.", "2026-04-15T10:00:00Z"),
  makeFallback("snowflake-web", "Snowflake", "website", "Website", "WEBSITE", "https://www.snowflake.com/en/migrate-to-the-cloud/", "Open page", "Snowflake's migration page openly promises low-risk modernization with free AI-powered tools. This is a clear install-base capture play against on-prem and legacy warehouse customers.", "2026-04-18T09:15:00Z"),
  makeFallback("redshift-blog", "Amazon Redshift", "blog", "Blog", "BLOG", "https://aws.amazon.com/blogs/big-data/amazon-redshift-dc2-migration-approach-with-a-customer-case-study/", "Open blog", "AWS is still publishing migration-centered Redshift content focused on performance gains and cost efficiency after moving off older warehouse setups. Netezza should answer with hybrid control and simpler estate transition proof.", "2026-03-11T09:00:00Z"),
  makeFallback("redshift-web", "Amazon Redshift", "website", "Website", "WEBSITE", "https://aws.amazon.com/redshift/features/", "Open page", "Redshift's feature page is leaning on price performance, lakehouse SQL, and near-real-time analytics. The AWS message is trying to make cloud-native scale feel like the obvious default.", "2026-04-18T09:10:00Z"),
  makeFallback("bigquery-blog", "Google BigQuery", "blog", "Blog", "BLOG", "https://cloud.google.com/blog/products/data-analytics/using-the-fully-managed-remote-bigquery-mcp-server-to-build-data-ai-agents", "Open blog", "Google Cloud is tying BigQuery directly to AI-agent workflows through the managed MCP server. That keeps BigQuery positioned as the analytics layer for agentic AI, where Netezza needs a more assertive governed-AI rebuttal.", "2026-01-07T08:00:00Z"),
  makeFallback("bigquery-tr", "Google BigQuery", "reviews", "TrustRadius", "TRUSTRADIUS", "https://www.trustradius.com/products/google-bigquery/reviews", "View TrustRadius", "BigQuery reviews are strong on scale and fast analytics, but still flag query-cost predictability and debugging friction. Netezza should attack that instability with more conviction.", "2026-01-02T09:00:00Z"),
  makeFallback("azure-web", "Azure Synapse", "website", "Website", "WEBSITE", "https://azure.microsoft.com/en-us/products/synapse-analytics/", "Open page", "Microsoft is using the Synapse page to funnel buyers toward Fabric migration. That weakens Synapse's standalone identity and gives Netezza a chance to frame focus as a strength.", "2026-04-18T09:05:00Z"),
  makeFallback("azure-tr", "Azure Synapse", "reviews", "TrustRadius", "TRUSTRADIUS", "https://www.trustradius.com/products/azure-synapse-analytics/reviews/all", "View TrustRadius", "TrustRadius feedback says Synapse works for large warehouse scenarios but is lagging in active development and feature momentum. Netezza should exploit that hesitation aggressively.", "2025-08-12T09:00:00Z"),
  makeFallback("teradata-li", "Teradata", "social", "LinkedIn", "LINKEDIN", "https://www.linkedin.com/company/teradata", "Open LinkedIn", "Teradata is loudly attaching agentic AI outcomes to hard ROI and lower operating cost. That message competes directly with Netezza in enterprise accounts that care about governed AI plus control.", "2026-04-18T11:00:00Z"),
  makeFallback("teradata-blog", "Teradata", "blog", "Blog", "BLOG", "https://www.teradata.com/Blogs/RSS", "Open blog", "Teradata's content and social footprint continue to wrap hybrid control and AI scale into one platform story. Netezza needs a sharper time-to-value and simplicity response.", "2026-04-10T09:00:00Z"),
];

export async function getMarketSignalsFeed({ force = false } = {}) {
  const now = Date.now();
  if (!force && cache.payload && cache.expiresAt > now) {
    return cache.payload;
  }

  const persistedSnapshot = force ? null : await readPersistedSnapshot();

  const settled = await Promise.allSettled(LIVE_MARKET_SOURCES.map((source) => fetchMarketSource(source)));
  const liveItems = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  const activeSources = settled.filter((result) => result.status === "fulfilled" && result.value.length).length;
  const failedSources = settled.length - activeSources;

  const persistedItems = Array.isArray(persistedSnapshot?.items) ? persistedSnapshot.items : [];
  const items = dedupeById([...liveItems, ...persistedItems, ...FALLBACK_MARKET_SIGNALS])
    .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))
    .slice(0, 36)
    .map((item) => ({
      ...item,
      isNew: hoursSince(item.publishedAt) <= 72,
      freshnessLabel: formatRelativeTime(item.publishedAt),
      dateLabel: formatDate(item.publishedAt),
    }));

  const payload = {
    meta: {
      status: activeSources
        ? `Live ${activeSources}/${LIVE_MARKET_SOURCES.length}`
        : persistedItems.length
          ? "Cached snapshot + fallback"
          : "Fallback snapshot",
      lastUpdated: new Date().toISOString(),
      activeSources,
      totalSources: LIVE_MARKET_SOURCES.length,
      failedSources,
      persistedSnapshotAt: persistedSnapshot?.meta?.lastUpdated || null,
    },
    items,
  };

  if (activeSources || !persistedItems.length) {
    await persistSnapshot(payload);
  }

  cache = {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };

  return payload;
}

async function fetchMarketSource(source) {
  try {
    const response = await fetchWithTimeout(source.sourceUrl, {
      headers: {
        "user-agent": "IBM-Netezza-Product-Marketing-Insights/1.0",
        accept: source.kind === "feed"
          ? "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.8"
          : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`${source.id} returned ${response.status}`);
    }

    const body = await response.text();
    return source.kind === "feed"
      ? parseFeedSource(body, source)
      : parseHtmlSource(body, source);
  } catch (error) {
    return [];
  }
}

function parseFeedSource(xml, source) {
  const parsedItems = getFeedBlocks(xml).map((block, index) => parseFeedBlock(block, source, index));
  const matchedItems = parsedItems.filter((item) => matchesAny(item, source.matchAny));
  const selectedItems = (matchedItems.length ? matchedItems : parsedItems).slice(0, 2);

  if (!selectedItems.length) {
    return [];
  }

  return selectedItems.map((item) =>
    makeSignalFromMatch(source, item.title, tuneSignalSummary(source, `${item.title}. ${item.summary}`), item.link, item.publishedAt)
  );
}

function parseHtmlSource(html, source) {
  const text = collapseWhitespace(stripTags(html));

  if (source.parser === "g2") {
    const rating = text.match(/(\d\.\d)\s*out of 5 stars/i)?.[1];
    const summary = between(text, "Review Summary", "Pros & Cons") || between(text, "Generated using AI from real user reviews", "Pros & Cons");
    if (!summary && !rating) {
      return [];
    }
    return [makeSignalFromMatch(source, `${source.competitor} review momentum`, tuneSignalSummary(source, `${source.competitor} is currently rated ${rating || "strongly"} on G2. ${summary || ""}`), source.sourceUrl, new Date().toISOString())];
  }

  if (source.parser === "trustradius") {
    const score = text.match(/Score\s+(\d\.\d)\s+out of 10/i)?.[1];
    const summary = between(text, "What users are saying about", "Read full review") || between(text, "Overview", "Read full review");
    if (!summary && !score) {
      return [];
    }
    return [makeSignalFromMatch(source, `${source.competitor} review benchmark`, tuneSignalSummary(source, `${source.competitor} currently shows ${score || "a strong"} TrustRadius score. ${summary || ""}`), source.sourceUrl, new Date().toISOString())];
  }

  if (source.parser === "linkedin") {
    const update = between(text, "Updates", "Jobs") || between(text, "Updates", "Browse jobs");
    if (!update) {
      return [];
    }
    return [makeSignalFromMatch(source, `${source.competitor} social narrative`, tuneSignalSummary(source, clipText(update, 320)), source.sourceUrl, new Date().toISOString())];
  }

  const title = extractTitle(html) || `${source.competitor} website emphasis`;
  const description = extractMetaDescription(html) || clipText(text, 260);
  return [makeSignalFromMatch(source, title, tuneSignalSummary(source, description), source.sourceUrl, new Date().toISOString())];
}

function makeSignalFromMatch(source, title, summary, url, publishedAt) {
  return {
    id: `${source.id}-${slugify(title).slice(0, 48)}`,
    competitor: source.competitor,
    group: source.group,
    headline: title,
    sourceLabel: source.sourceLabel,
    sourceBadge: source.sourceBadge,
    sourceUrl: url || source.sourceUrl,
    actionLabel: getActionLabel(source.group, source.sourceLabel),
    summary: clipText(summary, 360),
    publishedAt,
  };
}

function tuneSignalSummary(source, raw) {
  const compact = collapseWhitespace(raw);
  const rebuttal = {
    Databricks: "Treat this as a direct attempt to make traditional enterprise warehouse choices look obsolete. Netezza should answer on SQL-first simplicity, hybrid deployment, and lower change-management burden.",
    Snowflake: "This is Snowflake trying to win the modernization brief through ease and cloud momentum. Netezza should answer on TCO predictability and governed hybrid control.",
    "Amazon Redshift": "AWS is trying to keep modernization inside the AWS estate with performance and migration language. Netezza should counter on cross-estate simplicity, governance, and deployment freedom.",
    "Google BigQuery": "Google is pulling the conversation toward AI-native analytics and cloud-first scale. Netezza should counter on governed enterprise control and reduced architecture sprawl.",
    "Azure Synapse": "Microsoft's message keeps drifting toward a broader platform transition story. Netezza should use that to question focus and long-term product clarity.",
    Teradata: "Teradata is trying to retain enterprise credibility with hybrid and AI-at-scale language. Netezza should press on time-to-value and operational simplicity.",
  }[source.competitor] || "";

  return `${clipText(compact, 220)} ${rebuttal}`.trim();
}

function makeFallback(id, competitor, group, sourceLabel, sourceBadge, sourceUrl, actionLabel, summary, publishedAt) {
  return {
    id,
    competitor,
    group,
    headline: `${competitor} ${sourceLabel} signal`,
    sourceLabel,
    sourceBadge,
    sourceUrl,
    actionLabel,
    summary,
    publishedAt,
  };
}

function getFeedBlocks(xml) {
  const rss = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const atom = [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  return rss.length ? rss : atom;
}

function parseFeedBlock(block, source, index) {
  return {
    title: cleanText(extractTag(block, "title") || `${source.competitor} update ${index + 1}`),
    link: cleanText(extractTag(block, "link") || extractLinkHref(block) || source.sourceUrl),
    summary: cleanText(extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content") || ""),
    publishedAt: toIsoDate(extractTag(block, "pubDate") || extractTag(block, "updated") || extractTag(block, "published") || new Date().toISOString()),
  };
}

function extractTag(block, tagName) {
  return block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))?.[1] || "";
}

function extractLinkHref(block) {
  return block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "";
}

function extractTitle(html) {
  return cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
}

function extractMetaDescription(html) {
  return cleanText(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ||
    ""
  );
}

function between(text, start, end) {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) {
    return "";
  }
  const from = startIndex + start.length;
  const endIndex = text.indexOf(end, from);
  return cleanText(text.slice(from, endIndex === -1 ? from + 300 : endIndex));
}

function matchesAny(item, keywords = []) {
  if (!keywords?.length) {
    return true;
  }
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function stripTags(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function collapseWhitespace(value) {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function cleanText(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function clipText(text, length) {
  const clean = collapseWhitespace(text);
  return clean.length <= length ? clean : `${clean.slice(0, length - 3).trim()}...`;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toIsoDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function formatRelativeTime(value) {
  const hours = hoursSince(value);
  if (hours < 1) {
    return `${Math.max(1, Math.round(hours * 60))} min ago`;
  }
  if (hours < 24) {
    return `${Math.round(hours)} hr ago`;
  }
  return `${Math.round(hours / 24)} days ago`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function hoursSince(value) {
  return (Date.now() - new Date(value).getTime()) / 36e5;
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function getActionLabel(group, sourceLabel) {
  if (group === "social") return `Respond on ${sourceLabel}`;
  if (group === "reviews") return `Review ${sourceLabel}`;
  if (group === "blog") return "View & Counter";
  return "Analyze page";
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function readPersistedSnapshot() {
  try {
    const raw = await readFile(SNAPSHOT_FILE_URL, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed : null;
  } catch {
    return null;
  }
}

async function persistSnapshot(payload) {
  try {
    await mkdir(new URL("./.cache/", import.meta.url), { recursive: true });
    await writeFile(SNAPSHOT_FILE_URL, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // Snapshot persistence is a resilience enhancement only.
  }
}

