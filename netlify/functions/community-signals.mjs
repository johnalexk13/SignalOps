import { mkdir, readFile, writeFile } from "node:fs/promises";

const FETCH_TIMEOUT_MS = 9000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const SNAPSHOT_FILE_URL = new URL("./.cache/community-signals.json", import.meta.url);
const COMMUNITY_MATCH_TERMS = [
  "netezza",
  "data warehouse",
  "warehouse",
  "lakehouse",
  "snowflake",
  "bigquery",
  "redshift",
  "databricks",
  "query performance",
  "cost",
  "migration",
  "connector",
  "sql",
  "analytics",
  "etl",
  "elt",
  "olap",
];
const COMMUNITY_EXCLUDE_TERMS = ["dlthub", "readchangefeed", "sync(figma)", "auto-generated", "dskit", "fmkit", "metakit"];

let cache = {
  key: "",
  expiresAt: 0,
  payload: null,
};

const BASE_COMMUNITY_SOURCES = [
  {
    id: "ibm-community-netezza",
    kind: "html",
    platform: "IBM Community",
    community: "IBM Community",
    group: "Netezza Performance Server",
    play: "announcements",
    sourceLabel: "IBM Community",
    sourceBadge: "OFFICIAL",
    sourceUrl: "https://community.ibm.com/community/user/groups/community-home?CommunityKey=d9f9d5de-e89f-4a6a-84a0-31df8b81f182",
    alwaysInclude: true,
  },
  {
    id: "ibm-netezza-linkedin",
    kind: "html",
    platform: "LinkedIn",
    community: "LinkedIn",
    group: "Netezza and IBM TechXchange conversations",
    play: "announcements",
    sourceLabel: "LinkedIn",
    sourceBadge: "SOCIAL",
    sourceUrl: "https://www.linkedin.com/search/results/content/?keywords=netezza%20community%20day%20watsonx%20analytics",
  },
  {
    id: "reddit-dataengineering-warehouse",
    kind: "reddit",
    platform: "Reddit",
    community: "Reddit",
    group: "r/dataengineering",
    play: "replies",
    sourceLabel: "Reddit",
    sourceBadge: "REDDIT",
    sourceUrl: "https://www.reddit.com/r/dataengineering/search.json?q=data%20warehouse%20OR%20lakehouse%20OR%20query%20performance&restrict_sr=1&sort=new&limit=4",
    requiredAny: ["data warehouse", "warehouse", "lakehouse", "query performance", "migration"],
    excludeAny: ["just shipped", "launching", "hire", "job", "career"],
  },
  {
    id: "reddit-dataengineering-cost",
    kind: "reddit",
    platform: "Reddit",
    community: "Reddit",
    group: "r/dataengineering",
    play: "thought-leadership",
    sourceLabel: "Reddit",
    sourceBadge: "REDDIT",
    sourceUrl: "https://www.reddit.com/r/dataengineering/search.json?q=warehouse%20cost%20optimization%20OR%20Snowflake%20OR%20BigQuery%20OR%20Redshift&restrict_sr=1&sort=new&limit=4",
    requiredAny: ["snowflake", "bigquery", "redshift", "databricks", "lakehouse", "warehouse cost", "cost optimization"],
    excludeAny: ["just shipped", "dlthub", "hire", "job", "career"],
  },
  {
    id: "hn-data-warehouse",
    kind: "hn",
    platform: "Hacker News",
    community: "Hacker News",
    group: "Data platform launch and architecture threads",
    play: "thought-leadership",
    sourceLabel: "Hacker News",
    sourceBadge: "HN",
    sourceUrl: "https://hn.algolia.com/api/v1/search_by_date?query=data%20warehouse%20lakehouse%20analytics&tags=story&hitsPerPage=4",
    requiredAny: ["data warehouse", "warehouse", "lakehouse", "database", "analytics", "change data capture"],
    excludeAny: ["readchangefeed"],
  },
  {
    id: "stackoverflow-netezza",
    kind: "stackexchange",
    platform: "Stack Overflow",
    community: "Stack Overflow",
    group: "Netezza and warehouse troubleshooting questions",
    play: "replies",
    sourceLabel: "Stack Overflow",
    sourceBadge: "STACK",
    sourceUrl: "https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=activity&q=Netezza%20data%20warehouse&site=stackoverflow&pagesize=4",
  },
  {
    id: "github-netezza",
    kind: "github",
    platform: "GitHub",
    community: "GitHub",
    group: "Open issues and discussions mentioning Netezza",
    play: "replies",
    sourceLabel: "GitHub",
    sourceBadge: "GITHUB",
    sourceUrl: "https://api.github.com/search/issues?q=netezza%20in:title,body&sort=updated&order=desc&per_page=4",
    requiredAny: ["netezza", "nzsql", "nps"],
    titleRequiredAny: ["netezza", "nzsql", "nps", "odbc", "jdbc", "warehouse"],
    excludeAny: ["sync(figma)", "auto-generated", "dskit", "fmkit", "metakit"],
  },
  {
    id: "microsoft-answers-netezza",
    kind: "html",
    platform: "Microsoft Q&A",
    community: "Microsoft Q&A",
    group: "Azure Data Factory and Netezza connectivity",
    play: "replies",
    sourceLabel: "Microsoft Learn",
    sourceBadge: "AZURE",
    sourceUrl: "https://learn.microsoft.com/en-us/answers/questions/2224136/netezza-linked-service-has-an-error-payload-%28unrec",
    alwaysInclude: true,
  },
  {
    id: "alteryx-community-netezza",
    kind: "html",
    platform: "Alteryx Community",
    community: "Alteryx Community",
    group: "Netezza connector and workflow troubleshooting",
    play: "replies",
    sourceLabel: "Alteryx Community",
    sourceBadge: "INTEGRATION",
    sourceUrl: "https://community.alteryx.com/t5/Alteryx-Designer-Desktop-Discussions/Error-finding-connection-when-publishing-NETEZZA-data-source-to/td-p/1265055",
    alwaysInclude: true,
  },
  {
    id: "x-data-warehouse-search",
    kind: "html",
    platform: "X",
    community: "X",
    group: "Public warehouse and lakehouse threads",
    play: "announcements",
    sourceLabel: "X",
    sourceBadge: "SOCIAL",
    sourceUrl: "https://x.com/search?q=%22data%20warehouse%22%20netezza%20OR%20lakehouse&src=typed_query",
  },
];

const FALLBACK_COMMUNITY_SIGNALS = [
  makeFallback("fallback-ibm-community", "IBM Community", "Netezza Performance Server", "announcements", "IBM Community", "OFFICIAL", "https://community.ibm.com/community/user/groups/community-home?CommunityKey=d9f9d5de-e89f-4a6a-84a0-31df8b81f182", "Open official community", "Official Netezza community page is the safest launch and release-note destination. Use it for product announcements, follow-up Q&A, and collecting stakeholder questions after webinars.", "2026-05-18T09:00:00Z"),
  makeFallback("fallback-linkedin", "LinkedIn", "Netezza and IBM TechXchange conversations", "announcements", "LinkedIn", "SOCIAL", "https://www.linkedin.com/search/results/content/?keywords=netezza%20community%20day%20watsonx%20analytics", "Open LinkedIn search", "LinkedIn is the best social surface for Netezza Community Day, TechXchange, watsonx, and hybrid analytics amplification. Use concise POV posts and customer-safe proof points.", "2026-05-18T10:00:00Z"),
  makeFallback("fallback-reddit", "Reddit", "r/dataengineering", "replies", "Reddit", "REDDIT", "https://www.reddit.com/r/dataengineering/search/?q=data%20warehouse%20replacement&restrict_sr=1&sort=new", "Open Reddit search", "Practitioner discussions around warehouse replacement, Snowflake, BigQuery, Redshift, and Databricks are useful listening surfaces. Reply only with neutral workload-fit guidance, not product pitching.", "2026-05-17T11:00:00Z"),
  makeFallback("fallback-hn", "Hacker News", "Data platform launch and architecture threads", "thought-leadership", "Hacker News", "HN", "https://hn.algolia.com/?query=data%20warehouse%20lakehouse", "Open HN search", "Hacker News is best for architecture POVs when data warehouse, lakehouse, or AI-data-platform debates surface. Use it to sharpen the Netezza category narrative before broad publishing.", "2026-05-17T09:00:00Z"),
  makeFallback("fallback-stackoverflow", "Stack Overflow", "Netezza and warehouse troubleshooting questions", "replies", "Stack Overflow", "STACK", "https://stackoverflow.com/search?q=netezza+data+warehouse", "Open Stack Overflow", "Stack Overflow questions reveal exact implementation language around Netezza connectivity, SQL behavior, and warehouse troubleshooting. Turn recurring questions into support-ready content.", "2026-05-16T09:00:00Z"),
  makeFallback("fallback-github", "GitHub", "Open issues and discussions mentioning Netezza", "replies", "GitHub", "GITHUB", "https://github.com/search?q=netezza&type=issues", "Open GitHub search", "GitHub issues and discussions can expose connector, migration, and tooling blockers. Use this as source material for integration notes and release-readiness checklists.", "2026-05-16T08:00:00Z"),
  makeFallback("fallback-microsoft", "Microsoft Q&A", "Azure Data Factory and Netezza connectivity", "replies", "Microsoft Learn", "AZURE", "https://learn.microsoft.com/en-us/answers/questions/2224136/netezza-linked-service-has-an-error-payload-%28unrec", "Open Microsoft Q&A", "Azure Data Factory connectivity questions are useful signals for hybrid modernization accounts. Package answers into an Azure migration FAQ and seller support note.", "2026-05-15T08:00:00Z"),
  makeFallback("fallback-alteryx", "Alteryx Community", "Netezza connector and workflow troubleshooting", "replies", "Alteryx Community", "INTEGRATION", "https://community.alteryx.com/t5/Alteryx-Designer-Desktop-Discussions/Error-finding-connection-when-publishing-NETEZZA-data-source-to/td-p/1265055", "Open Alteryx thread", "Alteryx community troubleshooting shows analytics practitioners still run into Netezza workflow questions. Convert this into connector-readiness content and integration guidance.", "2026-05-15T07:00:00Z"),
];

export async function getCommunitySignalsFeed({ force = false, productName = "IBM Netezza", keywords = [], platforms = [] } = {}) {
  const normalizedKeywords = normalizeList(keywords);
  const normalizedPlatforms = normalizeList(platforms);
  const cacheKey = JSON.stringify({ productName, normalizedKeywords, normalizedPlatforms });
  const now = Date.now();

  if (!force && cache.payload && cache.key === cacheKey && cache.expiresAt > now) {
    return cache.payload;
  }

  const persistedSnapshot = force ? null : await readPersistedSnapshot();
  const sources = buildCommunitySources({ platforms: normalizedPlatforms });
  const settled = await Promise.allSettled(sources.map((source) => fetchCommunitySource(source, { productName, keywords: normalizedKeywords })));
  const liveItems = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  const activeSources = settled.filter((result) => result.status === "fulfilled" && result.value.length).length;
  const persistedItems = Array.isArray(persistedSnapshot?.items) ? persistedSnapshot.items : [];
  const failedSources = sources.length - activeSources;
  const annotatedLiveItems = liveItems.map((item) => annotateCommunityCoverage(item, "live"));
  const annotatedPersistedItems = persistedItems.map((item) => annotateCommunityCoverage(item, item.coverageType || "static"));
  const annotatedFallbackItems = FALLBACK_COMMUNITY_SIGNALS.map((item) => annotateCommunityCoverage(item, "static"));
  const sourceItems = activeSources ? [...annotatedLiveItems, ...annotatedFallbackItems] : [...annotatedPersistedItems, ...annotatedFallbackItems];
  const items = dedupeById(sourceItems)
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
        ? `Controlled crawler ${activeSources}/${sources.length}`
        : persistedItems.length
          ? "Cached community snapshot + fallback"
          : "Community fallback snapshot",
      lastUpdated: new Date().toISOString(),
      activeSources,
      totalSources: sources.length,
      failedSources,
      persistedSnapshotAt: persistedSnapshot?.meta?.lastUpdated || null,
      productName,
    },
    items,
  };

  if (activeSources || !persistedItems.length) {
    await persistSnapshot(payload);
  }

  cache = {
    key: cacheKey,
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };

  return payload;
}

function buildCommunitySources({ platforms }) {
  const selected = platforms.map((platform) => platform.toLowerCase());
  if (!selected.length) {
    return BASE_COMMUNITY_SOURCES;
  }

  return BASE_COMMUNITY_SOURCES.filter((source) => (
    source.alwaysInclude ||
    selected.some((platform) => source.platform.toLowerCase().includes(platform) || platform.includes(source.platform.toLowerCase()))
  ));
}

async function fetchCommunitySource(source, context) {
  try {
    const response = await fetchWithTimeout(source.sourceUrl, {
      headers: {
        "user-agent": "IBM-Netezza-Community-Intelligence/1.0",
        accept: source.kind === "html"
          ? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          : "application/json,text/plain,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`${source.id} returned ${response.status}`);
    }

    if (source.kind === "reddit" || source.kind === "hn" || source.kind === "stackexchange" || source.kind === "github") {
      const payload = await response.json();
      return parseJsonSource(payload, source, context);
    }

    const body = await response.text();
    return parseHtmlSource(body, source, context);
  } catch {
    return [];
  }
}

function parseJsonSource(payload, source, context) {
  if (source.kind === "reddit") {
    return (payload?.data?.children || []).filter((child) => matchesCommunityTerms(`${child?.data?.title || ""} ${child?.data?.selftext || ""}`, context, source)).slice(0, 3).map((child, index) => {
      const data = child?.data || {};
      return makeCommunitySignal(source, {
        idPart: data.id || index,
        title: data.title || `${source.group} discussion`,
        signal: clipText(data.selftext || data.title || "", 260),
        url: data.permalink ? `https://www.reddit.com${data.permalink}` : source.sourceUrl,
        publishedAt: data.created_utc ? new Date(data.created_utc * 1000).toISOString() : new Date().toISOString(),
      }, context);
    });
  }

  if (source.kind === "hn") {
    return (payload?.hits || []).filter((hit) => matchesCommunityTerms(`${hit.title || ""} ${hit.story_title || ""} ${hit.comment_text || ""} ${hit.story_text || ""}`, context, source)).slice(0, 3).map((hit, index) => makeCommunitySignal(source, {
      idPart: hit.objectID || index,
      title: hit.title || hit.story_title || "Hacker News data platform thread",
      signal: clipText(hit.comment_text || hit.title || hit.story_text || "", 260),
      url: hit.url || (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : source.sourceUrl),
      publishedAt: toIsoDate(hit.created_at || new Date().toISOString()),
    }, context));
  }

  if (source.kind === "stackexchange") {
    return (payload?.items || []).filter((item) => matchesCommunityTerms(`${item.title || ""} ${(item.tags || []).join(" ")}`, context, source)).slice(0, 3).map((item, index) => makeCommunitySignal(source, {
      idPart: item.question_id || index,
      title: cleanText(item.title || "Stack Overflow warehouse question"),
      signal: `Tags: ${(item.tags || []).slice(0, 5).join(", ") || "warehouse, Netezza"}. This is a technical question surface that can shape support and enablement content.`,
      url: item.link || source.sourceUrl,
      publishedAt: item.last_activity_date ? new Date(item.last_activity_date * 1000).toISOString() : new Date().toISOString(),
    }, context));
  }

  if (source.kind === "github") {
    return (payload?.items || []).filter((item) => (
      matchesCommunityTerms(`${item.title || ""} ${item.body || ""}`, context, source) &&
      matchesCommunityTerms(item.title || "", context, { requiredAny: source.titleRequiredAny || source.requiredAny })
    )).slice(0, 3).map((item, index) => makeCommunitySignal(source, {
      idPart: item.id || index,
      title: item.title || "GitHub Netezza issue",
      signal: clipText(item.body || item.title || "", 260),
      url: item.html_url || source.sourceUrl,
      publishedAt: toIsoDate(item.updated_at || item.created_at || new Date().toISOString()),
    }, context));
  }

  return [];
}

function parseHtmlSource(html, source, context) {
  const title = extractTitle(html) || source.group;
  const description = extractMetaDescription(html) || clipText(collapseWhitespace(stripTags(html)), 260);
  const usefulDescription = description && !/enable javascript|sign in|log in/i.test(description)
    ? description
    : `${source.group} is a source page monitored for ${context.productName} announcement, reply, and thought-leadership opportunities.`;

  return [makeCommunitySignal(source, {
    idPart: slugify(title).slice(0, 42) || "page",
    title,
    signal: usefulDescription,
    url: source.sourceUrl,
    publishedAt: new Date().toISOString(),
  }, context)];
}

function makeCommunitySignal(source, match, context) {
  const title = clipText(match.title, 140);
  const signal = clipText(match.signal || title, 300);
  return {
    id: `${source.id}-${slugify(match.idPart || title).slice(0, 42)}`,
    play: source.play,
    community: source.community,
    platform: source.platform,
    group: source.group,
    sourceLabel: source.sourceLabel,
    sourceBadge: source.sourceBadge,
    sourceUrl: match.url || source.sourceUrl,
    actionLabel: getActionLabel(source),
    title,
    signal,
    content: buildRecommendation(source, signal, context.productName),
    audience: getAudience(source),
    fit: getFit(source, context.productName),
    tags: getTags(source),
    publishedAt: match.publishedAt || new Date().toISOString(),
    coverageType: "live",
    coverageLabel: "Live",
  };
}

function annotateCommunityCoverage(item, coverageType) {
  const normalizedType = coverageType === "live" ? "live" : "static";
  return {
    ...item,
    coverageType: normalizedType,
    coverageLabel: normalizedType === "live" ? "Live" : "Static",
  };
}

function matchesCommunityTerms(value, context, source = {}) {
  const haystack = String(value || "").toLowerCase();
  if (!haystack.trim()) {
    return false;
  }

  const sourceTerms = normalizeList(source.requiredAny || []);
  const contextTerms = sourceTerms.length ? [] : normalizeList(context?.keywords || []);
  const terms = (sourceTerms.length ? sourceTerms : [...COMMUNITY_MATCH_TERMS, ...contextTerms]).map((term) => term.toLowerCase()).filter(Boolean);
  const excludedTerms = [...COMMUNITY_EXCLUDE_TERMS, ...normalizeList(source.excludeAny || [])].map((term) => term.toLowerCase()).filter(Boolean);
  return terms.some((term) => haystack.includes(term)) && !excludedTerms.some((term) => haystack.includes(term));
}

function buildRecommendation(source, signal, productName) {
  const shortProduct = productName.replace(/^IBM\s+/i, "") || productName;
  const base = {
    announcements: `Use this as a launch or release-amplification surface for ${shortProduct}. Keep the CTA source-linked and point readers to official IBM proof.`,
    "thought-leadership": `Use this conversation to shape a category POV for ${shortProduct}: workload fit, hybrid control, cost governance, and regulated analytics.`,
    replies: `Use this as a thread-native reply opportunity. Answer the user problem first, then connect to ${shortProduct} proof only where it is genuinely relevant.`,
  }[source.play] || `Use this as a monitored community signal for ${shortProduct}.`;

  if (/cost|price|credit|spend|optimization/i.test(signal)) {
    return `${base} Lead with cost-governance questions and avoid generic product promotion.`;
  }
  if (/migration|connect|driver|linked service|pipeline|etl|elt/i.test(signal)) {
    return `${base} Package the response as migration or integration guidance with exact setup checks.`;
  }
  if (/ai|agent|ml|analytics|lakehouse/i.test(signal)) {
    return `${base} Anchor the response in governed AI-ready analytics rather than broad platform claims.`;
  }
  return base;
}

function getActionLabel(source) {
  if (source.platform === "LinkedIn") return "Open LinkedIn source";
  if (source.platform === "Reddit") return "Open Reddit thread";
  if (source.platform === "Hacker News") return "Open HN thread";
  if (source.platform === "Stack Overflow") return "Open question";
  if (source.platform === "GitHub") return "Open GitHub item";
  return `Open ${source.sourceLabel}`;
}

function getAudience(source) {
  return {
    "IBM Community": "Netezza users, IBM practitioners, product stakeholders",
    LinkedIn: "Data leaders, architects, partners, PMM and sales followers",
    Reddit: "Data engineers, analytics engineers, hands-on evaluators",
    "Hacker News": "Technical decision-makers and infrastructure-minded readers",
    "Stack Overflow": "Implementers, DBAs, data engineers, troubleshooting users",
    GitHub: "Engineers, connector owners, open-source practitioners",
    "Microsoft Q&A": "Azure migration and data-pipeline practitioners",
    "Alteryx Community": "Analytics workflow users and connector troubleshooters",
    X: "Vendor watchers, practitioners, public data-platform commentators",
  }[source.community] || "Relevant data and analytics community members";
}

function getFit(source, productName) {
  const shortProduct = productName.replace(/^IBM\s+/i, "") || productName;
  return {
    announcements: `Strong fit when ${shortProduct} has launch news, release notes, product education, or official follow-up content.`,
    "thought-leadership": `Strong fit for architecture POVs, category framing, and competitor-counter narratives around warehouse modernization.`,
    replies: `Strong fit for contextual replies, integration answers, migration guidance, and support-ready proof points.`,
  }[source.play] || `Relevant monitored surface for ${shortProduct}.`;
}

function getTags(source) {
  const defaults = {
    announcements: ["Announcement", "Amplification"],
    "thought-leadership": ["POV", "Category narrative"],
    replies: ["Direct reply", "Troubleshooting"],
  }[source.play] || ["Community"];
  return [...defaults, source.sourceBadge].slice(0, 3);
}

function makeFallback(id, community, group, play, sourceLabel, sourceBadge, sourceUrl, actionLabel, signal, publishedAt) {
  return {
    id,
    community,
    platform: community,
    group,
    play,
    sourceLabel,
    sourceBadge,
    sourceUrl,
    actionLabel,
    title: `${community} signal`,
    signal,
    content: buildRecommendation({ play, platform: community, sourceLabel }, signal, "IBM Netezza"),
    audience: getAudience({ community }),
    fit: getFit({ play }, "IBM Netezza"),
    tags: getTags({ play, sourceBadge }),
    publishedAt,
    coverageType: "static",
    coverageLabel: "Static",
  };
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function stripTags(html) {
  return String(html || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function cleanText(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function collapseWhitespace(value) {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function clipText(text, length) {
  const clean = collapseWhitespace(text);
  return clean.length <= length ? clean : `${clean.slice(0, length - 3).trim()}...`;
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
    // Snapshot persistence is best-effort only.
  }
}
