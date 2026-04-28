const DEFAULT_COMPETITORS = [
  "Databricks",
  "Snowflake",
  "Amazon Redshift",
  "BigQuery",
  "Teradata",
];

const TOPIC_KEYWORDS = {
  AI: ["ai", "agent", "llm", "genai", "copilot", "ml"],
  Pricing: ["price", "pricing", "cost", "tco", "save"],
  Migration: ["migration", "modernization", "upgrade", "move"],
  Performance: ["speed", "performance", "latency", "scale", "benchmark"],
  Governance: ["governance", "security", "compliance", "trust"],
  Lakehouse: ["lakehouse", "open table", "iceberg", "delta"],
};

const SOURCE_WEIGHTS = {
  LinkedIn: 0.72,
  X: 0.68,
  G2: 0.86,
  TrustRadius: 0.84,
  Blog: 0.8,
  "Website change": 0.78,
};

exports.handler = async function handler() {
  try {
    const collection = await collectSignals();
    const normalized = normalizeSignals(collection.signals);
    const payload = buildPayload(normalized, collection.status);

    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(200, buildPayload(normalizeSignals(getMockSignals(error.message)), "Seed"));
  }
};

async function collectSignals() {
  const mockSignals = getMockSignals();
  const rssSignals = await collectRssSignals();

  if (!rssSignals.length) {
    return { signals: mockSignals, status: "Seed" };
  }

  return {
    signals: dedupeSignals([...rssSignals, ...mockSignals]).slice(0, 40),
    status: "Live + Seed",
  };
}

async function collectRssSignals() {
  const feeds = [
    { competitor: "Databricks", source: "Blog", sourceType: "Blog", url: "https://www.databricks.com/blog/rss.xml" },
    { competitor: "Snowflake", source: "Blog", sourceType: "Blog", url: "https://www.snowflake.com/blog/feed/" },
    { competitor: "Amazon Redshift", source: "Blog", sourceType: "Blog", url: "https://aws.amazon.com/blogs/big-data/feed/" },
    { competitor: "BigQuery", source: "Blog", sourceType: "Blog", url: "https://cloud.google.com/blog/products/data-analytics/rss/" },
    { competitor: "Teradata", source: "Blog", sourceType: "Blog", url: "https://www.teradata.com/Blogs/RSS" },
    ...readCustomFeeds(),
  ];

  const settled = await Promise.allSettled(feeds.map(fetchFeed));
  return settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: { "user-agent": "Netezza-PMM-Signal-Center/1.0" },
  });

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 5);

  return items.map((item, index) => {
    const chunk = item[1];
    const title = decodeXml(extractTag(chunk, "title") || `${feed.competitor} update ${index + 1}`);
    const link = decodeXml(extractTag(chunk, "link") || feed.url);
    const summary = decodeXml(
      extractTag(chunk, "description") ||
      extractTag(chunk, "content:encoded") ||
      `${feed.competitor} published a new update.`
    ).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const publishedAt = extractTag(chunk, "pubDate") || new Date().toUTCString();

    return {
      id: `${feed.competitor}-${index}-${slugify(title)}`,
      title,
      summary,
      source: feed.source,
      sourceType: feed.sourceType,
      competitor: feed.competitor,
      url: link,
      publishedAt,
    };
  });
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
      const confidence = clamp((sourceWeight * 0.55) + (freshness * 0.3) + (Math.min(corroboration, 4) * 0.08), 0.35, 0.96);
      const urgency = clamp((topicUrgency(signal.topic) * 0.45) + (freshness * 0.35) + (sourceWeight * 0.2), 0.28, 0.98);

      return {
        ...signal,
        corroboration,
        confidence: Number(confidence.toFixed(2)),
        urgency: Number(urgency.toFixed(2)),
      };
    })
    .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
}

function buildPayload(signals, status) {
  const competitorScores = DEFAULT_COMPETITORS.map((competitor) => {
    const competitorSignals = signals.filter((signal) => signal.competitor === competitor);
    const pressure = average(competitorSignals.map((signal) => signal.urgency)) || 0.32;
    const dominantTopic = mostCommon(competitorSignals.map((signal) => signal.topic)) || "Platform momentum";

    return {
      competitor,
      pressure: Number(pressure.toFixed(2)),
      narrative: `${competitor} is currently leaning into ${dominantTopic.toLowerCase()} narratives.`,
    };
  });

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      status,
      competitors: DEFAULT_COMPETITORS,
      sources: [...new Set(signals.map((signal) => signal.sourceType))],
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
  const sourceSignals = reviewSignals.length ? reviewSignals : signals;

  return sourceSignals.slice(0, 4).map((signal) => ({
    title: `${signal.competitor} review theme: ${signal.topic}`,
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
    prompt: `Create a Netezza PMM asset reacting to this competitor signal.\nCompetitor: ${signal.competitor}\nTopic: ${signal.topic}\nSignal: ${signal.title}\nSummary: ${signal.summary}\nDeliverables: battlecard addendum, one-slide executive summary, SDR talk track.`,
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
      summary: errorMessage ? `Live connectors partially failed, so fallback seed data remains active: ${errorMessage}` : "Fallback data is mixed with live RSS signals when private connectors are not yet configured.",
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

function readCustomFeeds() {
  try {
    const raw = process.env.CUSTOM_FEEDS_JSON;
    if (!raw) {
      return [];
    }

    const feeds = JSON.parse(raw);
    return Array.isArray(feeds) ? feeds.filter(isFeedDescriptor) : [];
  } catch (error) {
    return [];
  }
}

function isFeedDescriptor(feed) {
  return feed && feed.competitor && feed.source && feed.sourceType && feed.url;
}

function extractTag(xmlChunk, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i");
  return xmlChunk.match(regex)?.[1]?.trim();
}

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
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
