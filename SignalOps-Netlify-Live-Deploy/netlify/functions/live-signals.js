const fs = require("fs");
const path = require("path");

const DEFAULT_COMPETITORS = [
  "Databricks",
  "Snowflake",
  "Amazon Redshift",
  "BigQuery",
  "Teradata",
];

const DEFAULT_LIMIT = 5;
const MAX_SIGNALS = Number(process.env.MAX_SIGNALS || 60);
const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 10_000);

const TOPIC_KEYWORDS = {
  AI: ["ai", "agent", "assistant", "copilot", "cortex", "genai", "granite", "llm", "ml", "model", "watsonx"],
  Pricing: ["billing", "cost", "economics", "finops", "price", "pricing", "roi", "save", "tco"],
  Migration: ["migration", "modernization", "move", "on-prem", "upgrade"],
  Performance: ["benchmark", "latency", "performance", "query", "scale", "speed", "throughput"],
  Governance: ["compliance", "governance", "privacy", "security", "sovereignty", "trust"],
  Lakehouse: ["delta", "iceberg", "lakehouse", "open table", "unstructured"],
};

const SOURCE_WEIGHTS = {
  LinkedIn: 0.72,
  X: 0.68,
  G2: 0.86,
  TrustRadius: 0.84,
  Blog: 0.8,
  News: 0.76,
  "Release notes": 0.82,
  "Website change": 0.78,
  API: 0.83,
};

const DEFAULT_SOURCES = [
  {
    kind: "feed",
    competitor: "Databricks",
    source: "Databricks blog",
    sourceType: "Blog",
    url: "https://www.databricks.com/blog/rss.xml",
  },
  {
    kind: "feed",
    competitor: "Databricks",
    source: "Databricks docs feed",
    sourceType: "Release notes",
    url: "https://docs.databricks.com/aws/en/feed.xml",
    matchAny: ["release notes", "sql", "lakehouse", "warehouse", "ai", "governance"],
  },
  {
    kind: "feed",
    competitor: "Databricks",
    source: "Google News",
    sourceType: "News",
    url: buildGoogleNewsFeed("Databricks data warehouse OR lakehouse OR AI"),
  },
  {
    kind: "feed",
    competitor: "Snowflake",
    source: "Snowflake blog",
    sourceType: "Blog",
    url: "https://www.snowflake.com/blog/feed/",
  },
  {
    kind: "feed",
    competitor: "Snowflake",
    source: "Google News",
    sourceType: "News",
    url: buildGoogleNewsFeed("Snowflake data cloud OR warehouse OR AI"),
  },
  {
    kind: "feed",
    competitor: "Amazon Redshift",
    source: "AWS Big Data Blog",
    sourceType: "Blog",
    url: "https://aws.amazon.com/blogs/big-data/feed/",
    matchAny: ["redshift"],
  },
  {
    kind: "feed",
    competitor: "Amazon Redshift",
    source: "AWS What's New",
    sourceType: "Release notes",
    url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/",
    matchAny: ["redshift"],
  },
  {
    kind: "feed",
    competitor: "Amazon Redshift",
    source: "Google News",
    sourceType: "News",
    url: buildGoogleNewsFeed("\"Amazon Redshift\" data warehouse OR pricing OR AI"),
  },
  {
    kind: "feed",
    competitor: "BigQuery",
    source: "Google Cloud blog",
    sourceType: "Blog",
    url: "https://cloud.google.com/blog/products/data-analytics/rss/",
    matchAny: ["bigquery"],
  },
  {
    kind: "feed",
    competitor: "BigQuery",
    source: "BigQuery release notes",
    sourceType: "Release notes",
    url: "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml",
  },
  {
    kind: "feed",
    competitor: "BigQuery",
    source: "Google News",
    sourceType: "News",
    url: buildGoogleNewsFeed("BigQuery data warehouse OR analytics OR AI"),
  },
  {
    kind: "feed",
    competitor: "Teradata",
    source: "Teradata blogs",
    sourceType: "Blog",
    url: "https://www.teradata.com/Blogs/RSS",
  },
  {
    kind: "feed",
    competitor: "Teradata",
    source: "Google News",
    sourceType: "News",
    url: buildGoogleNewsFeed("Teradata Vantage analytics OR AI"),
  },
];

exports.handler = async function handler(event) {
  try {
    const collection = await collectSignals(event);
    const normalized = normalizeSignals(collection.signals);
    const payload = buildPayload(normalized, collection);

    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(
      200,
      buildPayload(normalizeSignals(getMockSignals(error.message)), {
        status: "Seed",
        connectors: { total: 0, active: 0, failed: 0 },
      })
    );
  }
};

async function collectSignals(event) {
  const mockSignals = getMockSignals();
  const sources = [...DEFAULT_SOURCES, ...readConfiguredSources()].map((source) => ({
    ...source,
    url: resolveRuntimeUrl(source.url, event),
  }));
  const settled = await Promise.allSettled(sources.map(fetchSource));

  const liveSignals = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  const active = settled.filter((result) => result.status === "fulfilled" && result.value.length).length;
  const failed = settled.filter((result) => result.status === "rejected").length;

  if (!liveSignals.length) {
    return {
      signals: mockSignals,
      status: "Seed",
      connectors: { total: sources.length, active: 0, failed },
    };
  }

  return {
    signals: dedupeSignals([...liveSignals, ...mockSignals]).slice(0, MAX_SIGNALS),
    status: `Live ${active}/${sources.length} + Seed`,
    connectors: { total: sources.length, active, failed },
  };
}

async function fetchSource(source) {
  switch (source.kind) {
    case "json":
      return fetchJsonSource(source);
    case "feed":
    default:
      return fetchFeedSource(source);
  }
}

async function fetchFeedSource(source) {
  const response = await fetchWithTimeout(source.url, {
    headers: {
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/plain;q=0.9, */*;q=0.8",
      "user-agent": "Netezza-PMM-Signal-Center/2.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${source.source} returned ${response.status}`);
  }

  const text = await response.text();
  const items = parseFeedItems(text, source).filter((item) => matchesSourceFilters(item, source));

  return items.slice(0, source.limit || DEFAULT_LIMIT).map((item, index) => mapItemToSignal(item, source, index));
}

async function fetchJsonSource(source) {
  const response = await fetchWithTimeout(source.url, {
    headers: {
      accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      "user-agent": "Netezza-PMM-Signal-Center/2.0",
      ...normalizeHeaders(source.headers),
    },
  });

  if (!response.ok) {
    throw new Error(`${source.source} returned ${response.status}`);
  }

  const payload = await response.json();
  const items = readPath(payload, source.itemsPath || "items");
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => mapJsonItem(item, source, index))
    .filter(Boolean)
    .filter((item) => matchesSourceFilters(item, source))
    .slice(0, source.limit || DEFAULT_LIMIT)
    .map((item, index) => mapItemToSignal(item, source, index));
}

function parseFeedItems(xml, source) {
  const rssItems = getBlocks(xml, "item");
  const atomEntries = getBlocks(xml, "entry");
  const chunks = rssItems.length ? rssItems : atomEntries;

  return chunks.map((chunk, index) => {
    const title = cleanText(
      decodeXml(extractTag(chunk, "title") || `${source.competitor} update ${index + 1}`)
    );
    const link = cleanText(
      decodeXml(
        extractTag(chunk, "link") ||
        extractAttribute(chunk, "link", "href") ||
        extractTag(chunk, "id") ||
        source.url
      )
    );
    const summary = cleanText(
      decodeXml(
        extractTag(chunk, "description") ||
        extractTag(chunk, "summary") ||
        extractTag(chunk, "content:encoded") ||
        extractTag(chunk, "content") ||
        `${source.competitor} published a new update.`
      )
    );
    const publishedAt = cleanText(
      extractTag(chunk, "pubDate") ||
      extractTag(chunk, "updated") ||
      extractTag(chunk, "published") ||
      extractTag(chunk, "dc:date") ||
      new Date().toISOString()
    );

    return {
      title,
      link,
      summary,
      publishedAt,
    };
  });
}

function mapJsonItem(item, source, index) {
  const title = cleanText(readPath(item, source.titlePath || "title") || `${source.competitor} update ${index + 1}`);
  const link = cleanText(readPath(item, source.linkPath || "url") || source.url);
  const summary = cleanText(
    readPath(item, source.summaryPath || "summary") ||
    readPath(item, "description") ||
    `${source.competitor} published a new update.`
  );
  const publishedAt = cleanText(
    readPath(item, source.datePath || "publishedAt") ||
    readPath(item, "date") ||
    new Date().toISOString()
  );

  if (!title) {
    return null;
  }

  return { title, link, summary, publishedAt };
}

function mapItemToSignal(item, source, index) {
  return {
    id: `${source.competitor}-${slugify(source.source)}-${index}-${slugify(item.title)}`,
    title: item.title,
    summary: item.summary,
    source: source.source,
    sourceType: source.sourceType,
    competitor: source.competitor,
    url: item.link || source.url,
    publishedAt: toIsoDate(item.publishedAt),
  };
}

function normalizeSignals(signals) {
  const topicalSignals = dedupeSignals(signals).map((signal) => ({
    ...signal,
    topic: inferTopic(signal),
  }));
  const corroborationIndex = buildCorroborationIndex(topicalSignals);

  return topicalSignals
    .map((signal) => {
      const freshness = freshnessScore(signal.publishedAt);
      const sourceWeight = SOURCE_WEIGHTS[signal.sourceType] || 0.65;
      const corroboration = corroborationIndex[`${signal.competitor}::${signal.topic}`] || 1;
      const confidence = clamp(
        (sourceWeight * 0.55) + (freshness * 0.3) + (Math.min(corroboration, 4) * 0.08),
        0.35,
        0.96
      );
      const urgency = clamp(
        (topicUrgency(signal.topic) * 0.45) + (freshness * 0.35) + (sourceWeight * 0.2),
        0.28,
        0.98
      );

      return {
        ...signal,
        corroboration,
        confidence: Number(confidence.toFixed(2)),
        urgency: Number(urgency.toFixed(2)),
      };
    })
    .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
}

function buildPayload(signals, collection) {
  const competitorScores = DEFAULT_COMPETITORS.map((competitor) => {
    const competitorSignals = signals.filter((signal) => signal.competitor === competitor);
    const pressure = average(competitorSignals.map((signal) => signal.urgency)) || 0.32;
    const dominantTopic = mostCommon(competitorSignals.map((signal) => signal.topic)) || "Platform momentum";
    const sourceMix = topItems(competitorSignals.map((signal) => signal.sourceType), 2).join(" and ");

    return {
      competitor,
      pressure: Number(pressure.toFixed(2)),
      narrative: `${competitor} is currently leaning into ${dominantTopic.toLowerCase()} narratives${sourceMix ? ` across ${sourceMix.toLowerCase()}` : ""}.`,
    };
  });

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      status: collection.status,
      competitors: DEFAULT_COMPETITORS,
      sources: [...new Set(signals.map((signal) => signal.sourceType))],
      connectors: collection.connectors,
    },
    signals,
    competitorScores,
    positioning: buildPositioning(signals),
    reviewsIntel: buildReviewsIntel(signals),
    thoughtLeadershipIdeas: buildThoughtLeadership(signals),
    actions: buildActions(signals),
    capabilitySuggestions: buildCapabilitySuggestions(signals),
  };
}

function buildPositioning(signals) {
  return DEFAULT_COMPETITORS.map((competitor) => {
    const competitorSignals = signals.filter((signal) => signal.competitor === competitor);
    const topic = mostCommon(competitorSignals.map((signal) => signal.topic)) || "operational simplicity";

    return {
      title: `Counter ${competitor} on ${topic.toLowerCase()}`,
      summary: `Anchor Netezza on trusted hybrid analytics outcomes, predictable governance, and lower change-management burden where ${competitor} is getting louder on ${topic.toLowerCase()}.`,
      ownerHint: "Owner: PMM narrative refresh",
    };
  }).slice(0, 4);
}

function buildReviewsIntel(signals) {
  const reviewSignals = signals.filter((signal) => ["G2", "TrustRadius"].includes(signal.sourceType));
  const sourceSignals = reviewSignals.length ? reviewSignals : signals.filter((signal) => signal.sourceType === "News" || signal.sourceType === "Blog");

  return sourceSignals.slice(0, 4).map((signal) => ({
    title: `${signal.competitor} proof theme: ${signal.topic}`,
    summary: `Validate customer proof against this signal: ${trimSummary(signal.summary)}.`,
    ownerHint: "Owner: Customer evidence and advocacy",
  }));
}

function buildThoughtLeadership(signals) {
  const topics = topItems(signals.map((signal) => signal.topic), 4);

  return topics.map((topic) => ({
    title: `Publish a Netezza point of view on ${topic.toLowerCase()}`,
    summary: `Build an executive narrative showing what buyers should prioritize, where hype is outrunning proof, and how Netezza reduces decision risk in ${topic.toLowerCase()}.`,
    ownerHint: "Owner: Content and thought leadership",
  }));
}

function buildActions(signals) {
  return signals.slice(0, 4).map((signal) => ({
    title: `Generate asset for ${signal.competitor} signal`,
    summary: `Create a one-pager, battlecard addendum, and social proof snippet reacting to "${signal.title}".`,
    ownerHint: "Owner: PMM launch and field enablement",
    prompt: `Create a Netezza PMM asset reacting to this competitor signal.\nCompetitor: ${signal.competitor}\nSource: ${signal.source} (${signal.sourceType})\nTopic: ${signal.topic}\nSignal: ${signal.title}\nSummary: ${signal.summary}\nDeliverables: battlecard addendum, one-slide executive summary, SDR talk track.`,
  }));
}

function buildCapabilitySuggestions(signals) {
  const topics = topItems(signals.map((signal) => signal.topic), 4);

  return topics.map((topic) => ({
    title: `Assess roadmap gap around ${topic.toLowerCase()}`,
    summary: `Review whether Netezza needs a sharper capability, packaging, or proof point to compete when buyers ask about ${topic.toLowerCase()}.`,
    ownerHint: "Owner: Product strategy and PMM",
  }));
}

function getMockSignals(errorMessage = "") {
  const now = Date.now();

  return [
    {
      id: "snowflake-linkedin-ai-governance",
      title: "Snowflake amplifies governance narrative for AI-ready data stacks",
      summary: "Recent social messaging emphasizes governed AI data access, faster app delivery, and simplified security posture for enterprise teams.",
      source: "LinkedIn post",
      sourceType: "LinkedIn",
      competitor: "Snowflake",
      url: "https://www.linkedin.com",
      publishedAt: new Date(now - 18 * 60 * 1000).toISOString(),
    },
    {
      id: "databricks-x-lakehouse",
      title: "Databricks pushes lakehouse migration and open-table momentum",
      summary: "Short-form updates point to migration accelerators, open formats, and reduced friction for teams consolidating AI and analytics workloads.",
      source: "X post",
      sourceType: "X",
      competitor: "Databricks",
      url: "https://x.com",
      publishedAt: new Date(now - 42 * 60 * 1000).toISOString(),
    },
    {
      id: "redshift-blog-performance",
      title: "Amazon Redshift blog highlights performance tuning for lower cost analytics",
      summary: "New technical guidance focuses on workload management, query acceleration, and cost controls for production data warehouse environments.",
      source: "AWS Big Data Blog",
      sourceType: "Blog",
      competitor: "Amazon Redshift",
      url: "https://aws.amazon.com/blogs/big-data/",
      publishedAt: new Date(now - 95 * 60 * 1000).toISOString(),
    },
    {
      id: "bigquery-site-pricing",
      title: "BigQuery pricing page and feature language appear updated",
      summary: "Website language suggests stronger emphasis on cost transparency, autoscaling, and integrated AI analysis across workloads.",
      source: "Website diff",
      sourceType: "Website change",
      competitor: "BigQuery",
      url: "https://cloud.google.com/bigquery",
      publishedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "teradata-g2-review-migration",
      title: "Trust and migration effort surface in recent Teradata review patterns",
      summary: "Review commentary suggests customers value scale and ecosystem fit but still mention onboarding complexity and long migration cycles.",
      source: "TrustRadius reviews",
      sourceType: "TrustRadius",
      competitor: "Teradata",
      url: "https://www.trustradius.com",
      publishedAt: new Date(now - 4.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "snowflake-g2-performance",
      title: "G2 reviewer feedback continues to mention speed with governance tradeoffs",
      summary: "Recent rating summaries highlight rapid setup and strong performance, paired with buyer scrutiny on cost management and role complexity.",
      source: "G2 review feed",
      sourceType: "G2",
      competitor: "Snowflake",
      url: "https://www.g2.com",
      publishedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "databricks-site-ai",
      title: "Databricks homepage shifts more prominently toward AI platform positioning",
      summary: "Hero copy and navigation changes appear to consolidate analytics, agents, and governance into one platform story.",
      source: "Website diff",
      sourceType: "Website change",
      competitor: "Databricks",
      url: "https://www.databricks.com",
      publishedAt: new Date(now - 7 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "fallback-note",
      title: "Connector note",
      summary: errorMessage
        ? `Live connectors partially failed, so fallback seed data remains active: ${errorMessage}`
        : "Fallback data is mixed with live feeds when private review, social, and diff connectors are not yet configured.",
      source: "System",
      sourceType: "Blog",
      competitor: "Snowflake",
      url: "https://netlify.com",
      publishedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    },
  ];
}

function dedupeSignals(signals) {
  const seen = new Set();

  return signals.filter((signal) => {
    const key = `${signal.competitor}-${slugify(signal.title)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function inferTopic(signal) {
  const haystack = `${signal.title} ${signal.summary}`.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return topic;
    }
  }
  return "Platform momentum";
}

function topicUrgency(topic) {
  const weights = {
    AI: 0.95,
    Pricing: 0.84,
    Migration: 0.75,
    Performance: 0.66,
    Governance: 0.78,
    Lakehouse: 0.8,
    "Platform momentum": 0.62,
  };

  return weights[topic] || 0.58;
}

function freshnessScore(publishedAt) {
  const hours = Math.max(1, (Date.now() - new Date(publishedAt).getTime()) / 36e5);
  return clamp(1 / Math.log2(hours + 2), 0.32, 0.98);
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildCorroborationIndex(signals) {
  const index = {};

  signals.forEach((signal) => {
    const key = `${signal.competitor}::${signal.topic}`;
    const bucket = index[key] || new Set();
    bucket.add(signal.sourceType);
    index[key] = bucket;
  });

  return Object.fromEntries(
    Object.entries(index).map(([key, sources]) => [key, sources.size])
  );
}

function topItems(items, limit) {
  return Object.entries(items.reduce((accumulator, item) => {
    accumulator[item] = (accumulator[item] || 0) + 1;
    return accumulator;
  }, {}))
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([item]) => item);
}

function mostCommon(items) {
  return topItems(items.filter(Boolean), 1)[0];
}

function readConfiguredSources() {
  const values = [
    ...readSourcesFromWorkspace(),
    ...readSourcesFromEnv("CUSTOM_SOURCES_JSON"),
    ...readSourcesFromEnv("CUSTOM_FEEDS_JSON"),
  ];

  return values.map(normalizeSourceDescriptor).filter(Boolean);
}

function readSourcesFromWorkspace() {
  try {
    const filePath = path.join(process.cwd(), "config", "relevant-sources.json");
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function readSourcesFromEnv(envName) {
  try {
    const raw = process.env[envName];
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function normalizeSourceDescriptor(source) {
  if (!source || !source.competitor || !source.source || !source.sourceType || !source.url) {
    return null;
  }

  return {
    kind: source.kind || "feed",
    competitor: source.competitor,
    source: source.source,
    sourceType: source.sourceType,
    url: source.url,
    limit: Number(source.limit || DEFAULT_LIMIT),
    itemsPath: source.itemsPath,
    titlePath: source.titlePath,
    linkPath: source.linkPath,
    summaryPath: source.summaryPath,
    datePath: source.datePath,
    headers: source.headers,
    matchAny: normalizeStringArray(source.matchAny),
    matchNone: normalizeStringArray(source.matchNone),
  };
}

function matchesSourceFilters(item, source) {
  const haystack = `${item.title} ${item.summary} ${item.link}`.toLowerCase();
  const matchAny = normalizeStringArray(source.matchAny);
  const matchNone = normalizeStringArray(source.matchNone);

  if (matchAny.length && !matchAny.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
    return false;
  }

  if (matchNone.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
    return false;
  }

  return true;
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function buildGoogleNewsFeed(query) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

function resolveRuntimeUrl(url, event) {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }

  if (!url.startsWith("/")) {
    return url;
  }

  const baseUrl =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.SITE_URL ||
    inferBaseUrl(event) ||
    "http://localhost:8888";

  return `${baseUrl.replace(/\/$/, "")}${url}`;
}

function inferBaseUrl(event) {
  const host = event?.headers?.host || event?.multiValueHeaders?.host?.[0];
  const proto =
    event?.headers?.["x-forwarded-proto"] ||
    event?.headers?.["X-Forwarded-Proto"] ||
    "https";

  if (!host) {
    return "";
  }

  return `${proto}://${host}`;
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function getBlocks(xml, tagName) {
  return [...xml.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))]
    .map((match) => match[1]);
}

function extractTag(xmlChunk, tagName) {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  return xmlChunk.match(regex)?.[1]?.trim();
}

function extractAttribute(xmlChunk, tagName, attributeName) {
  const regex = new RegExp(`<${tagName}\\b[^>]*${attributeName}="([^"]+)"[^>]*\\/?>`, "i");
  return xmlChunk.match(regex)?.[1]?.trim();
}

function readPath(value, path) {
  if (!path) {
    return undefined;
  }

  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }
    return current[key];
  }, value);
}

function normalizeHeaders(headers) {
  return headers && typeof headers === "object" ? headers : {};
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toIsoDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function trimSummary(summary) {
  return summary.length > 180 ? `${summary.slice(0, 177)}...` : summary;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify(body),
  };
}
