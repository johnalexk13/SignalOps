import { getMarketSignalsFeed } from "./market-signals.mjs";

const CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_CONTENT_IDEAS = 15;
const FRESH_SIGNAL_WINDOW_HOURS = 7 * 24;

let cache = {
  expiresAt: 0,
  payload: null,
};

const COMPETITOR_PRESSURE = {
  Databricks: 92,
  Snowflake: 88,
  "Google BigQuery": 81,
  "Amazon Redshift": 75,
  "Azure Synapse": 69,
  Teradata: 64,
};

const COMPETITOR_SHORT = {
  Databricks: "Databricks",
  Snowflake: "Snowflake",
  "Amazon Redshift": "Redshift",
  "Google BigQuery": "BigQuery",
  "Azure Synapse": "Synapse",
  Teradata: "Teradata",
};

const BASE_SENTIMENT = {
  "IBM Netezza": { positive: 74, neutral: 17, negative: 9 },
  Databricks: { positive: 68, neutral: 17, negative: 15 },
  Snowflake: { positive: 78, neutral: 14, negative: 8 },
  "Amazon Redshift": { positive: 62, neutral: 20, negative: 18 },
  "Google BigQuery": { positive: 70, neutral: 18, negative: 12 },
  "Azure Synapse": { positive: 65, neutral: 20, negative: 15 },
  Teradata: { positive: 60, neutral: 18, negative: 22 },
};

const PRODUCT_CONFIRMED_CAPABILITIES = [
  "Apache Iceberg support (GA)",
  "Native Cloud Object Storage / NCOS (GA - AWS & Azure)",
  "Time Travel (historical versioning)",
  "AI Database Assistant (NL troubleshooting)",
  "HIPAA-ready + SOC 2 Type 2",
  "watsonx.data integration (Hadoop / Hive / Kerberos)",
  "GCP BYOC - announced 2026",
  "Unity Catalog + AWS Glue / Azure Purview integrations",
];

const PRODUCT_CONFIRMED_STRENGTHS = [
  {
    status: "Shipped - GA",
    title: "Apache Iceberg open table format support",
    summary: "IBM Netezza now supports Apache Iceberg natively, with buyer-facing compatibility language around Unity Catalog, AWS Glue, and Azure Purview. This closes one of the most cited open-table objections in competitive evaluations.",
    leverage: "Lead with this in all Databricks and Snowflake competitive deals immediately.",
    tags: ["Open table formats", "Counter 'open lakehouse' narrative", "Gap closed"],
  },
  {
    status: "Shipped - GA",
    title: "Native Cloud Object Storage (NCOS) - 5-15x cheaper than block storage",
    summary: "NCOS is generally available on both AWS and Azure, delivering compute-storage separation and transparent usage-based billing. This gives Netezza a credible economics story it previously lacked in cloud comparisons.",
    leverage: "Update TCO messaging and pricing battle cards with NCOS cost-angle proof.",
    tags: ["TCO messaging", "Cloud economics", "Counters Snowflake cost pressure"],
  },
  {
    status: "Shipped - GA",
    title: "Time Travel + HIPAA / SOC 2 posture",
    summary: "Historical versioning plus regulated-readiness proof strengthens Netezza's differentiation with buyers who care about governance, auditability, and operational trust more than cloud-only novelty.",
    leverage: "Use this as the default PMM message in BFSI, healthcare, and public-sector narratives.",
    tags: ["Regulated industries", "Governance", "Auditability"],
  },
];

const PRODUCT_GAP_BLUEPRINTS = [
  {
    id: "ai-ml",
    priority: "P1 - Critical",
    title: "Full in-database ML training and inference for data scientists",
    gapScore: "6.5 / 10",
    copy: "Netezza has made progress with watsonx.data integration and the 2026 roadmap now includes custom ML models and unstructured text processing inside the engine. The remaining gap is a fuller in-database ML story for data scientists, where Databricks, Snowflake Cortex, and BigQuery still market more aggressively.",
    current: "watsonx.data integration, Hadoop / Hive / Kerberos connectivity, custom ML in-engine roadmap",
    leverage: "IBM watsonx.ai + watsonx.data + Granite models",
    impact: "CDO, Head of Data Science, Data Architect",
    competitors: ["Databricks MLflow + Runtime", "Snowflake Cortex AI", "BigQuery ML + Vertex AI", "Azure Synapse + OpenAI"],
    keywords: ["ai", "agent", "ml", "model", "genai", "cortex", "vertex", "assistant"],
  },
  {
    id: "nlq",
    priority: "P2 - High",
    title: "Expand NLQ from ops assistant to full business-user query interface",
    gapScore: "5.0 / 10",
    copy: "The AI-powered Database Assistant is a meaningful step forward, but it is still oriented toward DBAs and ops teams. The remaining gap is a natural-language experience that lets business users ask analytical questions directly and get governed SQL-backed answers.",
    current: "AI Database Assistant - NL troubleshooting, metric retrieval, config insights",
    leverage: "IBM watsonx Assistant + Granite LLM + semantic layer",
    impact: "Business Analyst, BI Lead, CDO, CFO",
    competitors: ["Databricks AI / Genie", "Snowflake Cortex Analyst", "BigQuery DataQnA / NLQ", "Synapse + Copilot"],
    keywords: ["nlq", "natural language", "copilot", "genie", "assistant", "question"],
  },
  {
    id: "sharing",
    priority: "P2 - High",
    title: "Governed data sharing marketplace",
    gapScore: "6.5 / 10",
    copy: "Snowflake Marketplace and Databricks Delta Sharing have become ecosystem moats. Netezza still needs a stronger governed sharing capability that lets customers expose read-only data products across organizations without losing control.",
    current: "Unified metadata management, watsonx.data ecosystem connectivity",
    leverage: "IBM Cloud Pak for Data + IAM governance",
    impact: "CDO, Data Product Owner, Partner ecosystem teams",
    competitors: ["Snowflake Data Marketplace", "Databricks Delta Sharing", "BigQuery Analytics Hub"],
    keywords: ["sharing", "share", "marketplace", "exchange", "data product"],
  },
  {
    id: "streaming",
    priority: "P3 - Strategic",
    title: "Real-time streaming analytics ingestion",
    gapScore: "6.2 / 10",
    copy: "Databricks, BigQuery, and Azure Synapse all support stronger streaming and real-time ingestion patterns. Netezza remains optimized for batch analytics, which is fine for many accounts, but a connector-layer streaming story would prevent losses in BFSI and telecom evaluations.",
    current: "Batch-optimized structured analytics with strong governed performance",
    leverage: "IBM Event Streams (Kafka managed) + IBM DataStage",
    impact: "Data Engineer, Platform Architect, BFSI / Telco verticals",
    competitors: ["Databricks Structured Streaming", "BigQuery Streaming + Pub/Sub", "Synapse + Event Hub"],
    keywords: ["stream", "realtime", "real-time", "event", "kafka", "ingestion"],
  },
];

const POSITIONING_PILLARS = [
  { tone: "pillar-content", title: "Performance certainty", text: "Position Netezza as the structured analytics platform that delivers speed without cloud-billing drama or platform sprawl." },
  { tone: "pillar-events", title: "Hybrid freedom", text: "Make deployment flexibility central whenever the evaluation includes sovereignty, residency, or infrastructure control requirements." },
  { tone: "pillar-market", title: "Predictable economics", text: "Use cost stories, NCOS proof, and governance-friendly economics to neutralize cloud-first pricing narratives." },
  { tone: "pillar-product", title: "Regulated-ready trust", text: "Turn IBM credibility into a specific narrative for compliance-heavy, risk-sensitive analytics environments." },
  { tone: "pillar-positioning", title: "SQL-first simplicity", text: "Highlight operational simplicity and analyst productivity when competitors drift toward engineering-heavy platform messaging." },
];

export async function getWorkspaceIntelligence({ force = false } = {}) {
  const now = Date.now();
  if (!force && cache.payload && cache.expiresAt > now) {
    return cache.payload;
  }

  const marketFeed = await getMarketSignalsFeed({ force });
  const signals = Array.isArray(marketFeed.items) ? marketFeed.items : [];

  const content = buildContentSection(signals);
  const events = buildPmmSection(signals);
  const product = buildProductSection(signals);
  const positioning = buildPositioningSection(signals, product);
  const overview = buildOverviewSection(signals, { content, events, product, positioning });

  const payload = {
    meta: {
      ...marketFeed.meta,
      mode: marketFeed.meta?.activeSources ? "live" : "snapshot",
      generatedAt: new Date().toISOString(),
    },
    marketFeed,
    sections: {
      overview,
      content,
      events,
      product,
      positioning,
    },
  };

  cache = {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };

  return payload;
}

function buildContentSection(signals) {
  const candidates = selectContentCandidates(signals, MAX_CONTENT_IDEAS);
  const lead = candidates[0];

  return {
    alert: lead
      ? {
          title: `Urgent: ${shortName(lead.competitor)} counter-narrative should ship this week`,
          copy: `${lead.competitor}'s latest ${lead.sourceLabel.toLowerCase()} signal is pushing a fresh modernization story. Publish one response asset quickly so the market sees Netezza's hybrid, SQL-first position in the same decision window.`,
        }
      : {
          title: "Urgent: keep the competitive publishing queue warm",
          copy: "The live signal engine did not produce a current lead signal, so the page is falling back to baseline content recommendations.",
        },
    ideas: candidates.length ? candidates.map((signal, index) => createContentIdea(signal, index)) : [],
  };
}

function buildPmmSection(signals) {
  const competitorLeads = topSignalsByCompetitor(signals).slice(0, 6);
  const lead = competitorLeads[0];

  const actions = [];
  competitorLeads.slice(0, 3).forEach((signal, index) => {
    actions.push(createBattleCardAction(signal, index));
  });
  if (lead) {
    actions.push(createCounterPostAction(lead));
    actions.push(createExecutiveBriefingAction(competitorLeads));
    actions.push(createAnalystBriefingAction(competitorLeads));
  }

  return {
    alert: lead
      ? {
          title: `Urgent PMM actions - ${shortName(lead.competitor)} pressure`,
          copy: `Two immediate actions are recommended from the live feed: ship the ${shortName(lead.competitor)} response asset first, then arm sellers with a fresh battle card and executive talk track based on the latest source evidence.`,
        }
      : {
          title: "Urgent PMM actions - monitoring mode",
          copy: "Live PMM triggers are temporarily thin, so the page is holding on baseline asset recommendations.",
        },
    actions: dedupeById(actions).slice(0, 8),
  };
}

function buildProductSection(signals) {
  const criticalGap = pickCriticalGap(signals);
  const strengths = PRODUCT_CONFIRMED_STRENGTHS.map((item, index) => {
    const proofSignal = topSignalForCompetitor(signals, index === 0 ? "Databricks" : index === 1 ? "Snowflake" : "Google BigQuery");
    if (!proofSignal) return item;
    return {
      ...item,
      summary: `${item.summary} Latest market pressure: ${proofSignal.competitor}'s ${proofSignal.sourceLabel.toLowerCase()} signal still leans on ${extractTheme(proofSignal)}.`,
    };
  });

  const remainingGaps = PRODUCT_GAP_BLUEPRINTS
    .map((gap) => enrichProductGap(gap, signals))
    .sort((left, right) => parseGapScore(right.gapScore) - parseGapScore(left.gapScore));

  return {
    confirmedCapabilities: PRODUCT_CONFIRMED_CAPABILITIES,
    criticalGap,
    confirmedStrengths: strengths,
    remainingGaps,
  };
}

function buildPositioningSection(signals, product) {
  const topThreats = topSignalsByCompetitor(signals).slice(0, 4);
  const recommendationLead = topThreats[0];
  const responseAngles = topThreats.map((signal, index) => createResponseAngle(signal, index));

  return {
    recommendation: {
      label: "Live positioning recommendation",
      statement: "The enterprise SQL data warehouse for teams that need predictable performance, hybrid flexibility, and governed structured analytics without the complexity of a lakehouse.",
      evidence: recommendationLead
        ? `Latest proof: ${recommendationLead.competitor}'s ${recommendationLead.sourceLabel.toLowerCase()} signal is reinforcing ${extractTheme(recommendationLead)}. That keeps Netezza's best response anchored in control, simplicity, and workload-fit credibility.`
        : "Latest proof is unavailable, so the positioning guidance is staying anchored to the stable hybrid-governed analytics narrative.",
    },
    messagePillars: POSITIONING_PILLARS.map((pillar, index) => ({
      ...pillar,
      text: index < topThreats.length
        ? `${pillar.text} Right now this matters because ${topThreats[index].competitor} is emphasizing ${extractTheme(topThreats[index])}.`
        : pillar.text,
    })),
    responseAngles,
    productCriticalGap: product.criticalGap,
  };
}

function buildOverviewSection(signals, sections) {
  return {
    pageInsights: {
      content: toOverviewInsight(sections.content.ideas[0], "content"),
      events: toOverviewInsight(sections.events.actions[0], "events"),
      market: createMarketOverviewInsight(signals[0]),
      product: toOverviewInsight(sections.product.remainingGaps[0], "product"),
      positioning: toOverviewInsight(sections.positioning.responseAngles[0], "positioning"),
    },
    sentiment: buildSentiment(signals),
  };
}

function createContentIdea(signal, index) {
  const platform = getContentPlatform(signal);
  const status = index === 0 ? "Urgent" : hoursSince(signal.publishedAt) <= 120 ? "New" : "";
  const title = getContentTitle(signal, index);
  const sourceNote = `${signal.competitor} ${signal.sourceLabel}`;

  return {
    id: `live-content-${signal.id}`,
    icon: getIconForGroup(signal.group),
    title,
    summary: `${clipText(signal.summary, 190)} Map this to ${platform.toLowerCase()} with a direct Netezza response to ${sourceNote}.`,
    platform,
    status,
    tags: [
      platform,
      `Counter-${shortName(signal.competitor)}`,
      signal.sourceBadge,
      signal.freshnessLabel || "Live signal",
    ],
    outline: buildContentOutline(signal, platform, title),
  };
}

function createBattleCardAction(signal, index) {
  return {
    id: `live-pmm-battle-${signal.id}`,
    icon: "X",
    title: `Battle card: Netezza vs ${shortName(signal.competitor)}`,
    summary: `Refresh the seller battle card with live evidence from ${signal.sourceLabel}. Focus on ${extractTheme(signal)} and current objection handlers.`,
    status: index === 0 ? "Urgent" : "",
    outline: buildBattleCardOutline(signal),
  };
}

function createCounterPostAction(signal) {
  return {
    id: `live-pmm-counter-${signal.id}`,
    icon: "!",
    title: `Counter-post: ${shortName(signal.competitor)} ${signal.sourceLabel.toLowerCase()} narrative`,
    summary: `Create a short executive-ready post that answers ${signal.competitor}'s latest ${signal.sourceLabel.toLowerCase()} message with a clearer Netezza point of view.`,
    status: "Urgent",
    outline: buildCounterPostOutline(signal),
  };
}

function createExecutiveBriefingAction(signals) {
  const leaders = signals.map((signal) => shortName(signal.competitor)).join(", ");
  return {
    id: "live-pmm-cio-briefing",
    icon: "=",
    title: "CIO briefing: live competitive position",
    summary: `Executive-ready narrative covering the current pressure set across ${leaders}.`,
    status: "",
    outline: `OUTLINE - CIO briefing\n\nSlide 1 - What changed in the last refresh window\n${signals.map((signal) => `- ${signal.competitor}: ${clipText(signal.summary, 110)}`).join("\n")}\n\nSlide 2 - Where Netezza still leads\n- Hybrid / on-prem flexibility\n- Predictable economics\n- SQL-first governed analytics\n\nSlide 3 - What to say in active deals\n- Keep cloud-only narratives workload-specific\n- Use IBM trust and regulated-readiness proof\n- Avoid parity language where the proof is not ready\n\nSlide 4 - Immediate asks for PMM and sales\n- Update battle cards\n- Refresh web proof\n- Push one executive POV asset this week`,
  };
}

function createAnalystBriefingAction(signals) {
  return {
    id: "live-pmm-analyst-briefing",
    icon: "^",
    title: "Analyst briefing topics - live narrative shifts",
    summary: "Package the latest competitive narratives into a concise analyst briefing memo so category framing does not drift toward cloud-only assumptions.",
    status: "",
    outline: `OUTLINE - Analyst briefing memo\n\nTheme 1 - Why structured analytics still needs its own narrative\nTheme 2 - Which competitor messages are gaining share of voice now\n${signals.map((signal) => `- ${signal.competitor}: ${extractTheme(signal)}`).join("\n")}\n\nTheme 3 - Why hybrid deployment remains strategic\nTheme 4 - Why predictable economics should stay in category evaluation criteria\nTheme 5 - What IBM wants analysts to notice in Netezza's 2026 story\n\nDeliverables\n- 1-page memo\n- 5 talking points\n- follow-up proof links`,
  };
}

function createResponseAngle(signal, index) {
  return {
    competitor: signal.competitor,
    priority: index === 0 ? "Primary angle" : index === 1 ? "Rebuttal" : "Sales angle",
    title: `Counter ${shortName(signal.competitor)} on ${extractTheme(signal)}`,
    summary: `${signal.competitor}'s latest ${signal.sourceLabel.toLowerCase()} signal is pressing on ${extractTheme(signal)}. That is exactly where Netezza should respond with governed simplicity and clearer workload-fit language.`,
    recommendation: getResponseRecommendation(signal),
    tags: [shortName(signal.competitor), signal.sourceBadge, signal.freshnessLabel || "Live"],
  };
}

function toOverviewInsight(item, tone) {
  if (!item) {
    return {
      competitor: "Monitoring",
      priority: "Watching",
      title: `No ${tone} signal yet`,
      summary: "The live engine has not produced a current recommendation for this section, so the workspace is holding on baseline guidance.",
      recommendation: "Refresh the feed or keep using the seeded strategic recommendation.",
    };
  }

  if (item.recommendation) {
    return item;
  }

  return {
    competitor: item.competitors?.[0] || "IBM Netezza",
    priority: item.priority || item.status || "Live",
    title: item.title,
    summary: item.summary || item.copy || "",
    recommendation: item.leverage || item.current || "Use this live insight in the matching section.",
  };
}

function createMarketOverviewInsight(signal) {
  if (!signal) {
    return {
      competitor: "Monitoring",
      priority: "Watching",
      title: "No market signal available",
      summary: "The live signal engine did not return a current external signal.",
      recommendation: "Refresh the market feed or use the snapshot signal set.",
    };
  }

  return {
    competitor: signal.competitor,
    priority: signal.freshnessLabel || "Live",
    title: signal.headline || `${signal.competitor} ${signal.sourceLabel} signal`,
    summary: signal.summary,
    recommendation: `${getActionFromSignal(signal)} from the Market Signals page.`,
  };
}

function buildSentiment(signals) {
  const output = [
    { name: "IBM Netezza", ...BASE_SENTIMENT["IBM Netezza"] },
    ...Object.keys(COMPETITOR_PRESSURE).map((competitor) => {
      const baseline = { ...BASE_SENTIMENT[competitor] };
      const reviewSignal = signals.find((signal) => signal.competitor === competitor && signal.group === "reviews");
      if (!reviewSignal) {
        return { name: competitor, ...baseline };
      }

      const summary = `${reviewSignal.headline || ""} ${reviewSignal.summary}`.toLowerCase();
      const positiveHits = countKeywords(summary, ["strong", "fast", "reliable", "scale", "satisfaction", "easy", "ease", "performance"]);
      const negativeHits = countKeywords(summary, ["cost", "complexity", "friction", "lagging", "risk", "debug", "slow", "complaint"]);
      const delta = Math.max(-8, Math.min(8, (positiveHits - negativeHits) * 2));
      const positive = clamp(baseline.positive + delta, 45, 84);
      const negative = clamp(baseline.negative - delta, 6, 26);
      const neutral = 100 - positive - negative;
      return { name: competitor, positive, neutral, negative };
    }),
  ];

  return output;
}

function pickCriticalGap(signals) {
  const ranked = PRODUCT_GAP_BLUEPRINTS.map((gap) => ({
    gap,
    score: signals.reduce((sum, signal) => sum + countKeywords(`${signal.headline} ${signal.summary}`.toLowerCase(), gap.keywords), 0),
    leadSignal: signals.find((signal) => countKeywords(`${signal.headline} ${signal.summary}`.toLowerCase(), gap.keywords) > 0),
  })).sort((left, right) => right.score - left.score);

  const top = ranked[0];
  if (!top || !top.score) {
    return {
      title: "Remaining critical gap - full AI / ML in-database execution and business-user NLQ",
      copy: "Iceberg, NCOS, Time Travel, and the AI Database Assistant are now confirmed shipped or packaged for PMM. The biggest remaining gaps versus Databricks, Snowflake Cortex, and BigQuery are full in-database ML training / inference for data scientists and a broader natural-language query experience for business users.",
    };
  }

  return {
    title: `Remaining critical gap - ${top.gap.title.toLowerCase()}`,
    copy: `${top.gap.copy} Live pressure signal: ${top.leadSignal.competitor}'s latest ${top.leadSignal.sourceLabel.toLowerCase()} update is reinforcing ${extractTheme(top.leadSignal)}.`,
  };
}

function enrichProductGap(gap, signals) {
  const related = signals.filter((signal) => countKeywords(`${signal.headline} ${signal.summary}`.toLowerCase(), gap.keywords) > 0).slice(0, 2);
  if (!related.length) {
    return gap;
  }

  const lead = related[0];
  return {
    ...gap,
    copy: `${gap.copy} Current evidence: ${lead.competitor}'s ${lead.sourceLabel.toLowerCase()} signal is actively marketing ${extractTheme(lead)}.`,
    competitors: dedupeStrings([...gap.competitors, ...related.map((signal) => `${shortName(signal.competitor)} ${signal.sourceLabel}`)]),
  };
}

function rankSignals(signals, groupOrder = []) {
  const priorityByGroup = new Map(groupOrder.map((group, index) => [group, groupOrder.length - index]));
  return [...signals]
    .sort((left, right) => {
      const leftPriority = scoreSignalPriority(left, priorityByGroup);
      const rightPriority = scoreSignalPriority(right, priorityByGroup);
      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
      }
      return new Date(right.publishedAt) - new Date(left.publishedAt);
    });
}

function scoreSignalPriority(signal, priorityByGroup = new Map()) {
  const pressure = COMPETITOR_PRESSURE[signal.competitor] || 0;
  const groupPriority = priorityByGroup.get(signal.group) || 0;
  const ageHours = hoursSince(signal.publishedAt);
  const freshnessBoost = ageHours <= 24
    ? 18
    : ageHours <= 72
      ? 12
      : ageHours <= FRESH_SIGNAL_WINDOW_HOURS
        ? 6
        : 0;
  const corroborationBoost = Math.min(6, Number(signal.corroboration || 0) * 2);
  return pressure + groupPriority + freshnessBoost + corroborationBoost;
}

function selectContentCandidates(signals, limit) {
  const ranked = rankSignals(signals, ["blog", "website", "reviews", "social"]);
  const freshSignals = ranked.filter((signal) => hoursSince(signal.publishedAt) <= FRESH_SIGNAL_WINDOW_HOURS);
  const pool = freshSignals.length >= Math.min(limit, 8) ? freshSignals : ranked;
  const picks = [];
  const byCompetitor = new Map();

  for (const signal of pool) {
    const current = byCompetitor.get(signal.competitor) || 0;
    if (current >= 3) {
      continue;
    }
    picks.push(signal);
    byCompetitor.set(signal.competitor, current + 1);
    if (picks.length === limit) {
      return picks;
    }
  }

  for (const signal of ranked) {
    if (picks.some((item) => item.id === signal.id)) {
      continue;
    }
    picks.push(signal);
    if (picks.length === limit) {
      break;
    }
  }

  return picks;
}

function topSignalsByCompetitor(signals) {
  const chosen = new Map();
  rankSignals(signals, ["social", "blog", "website", "reviews"]).forEach((signal) => {
    if (!chosen.has(signal.competitor)) {
      chosen.set(signal.competitor, signal);
    }
  });
  return [...chosen.values()];
}

function topSignalForCompetitor(signals, competitor) {
  return rankSignals(signals.filter((signal) => signal.competitor === competitor), ["blog", "website", "reviews", "social"])[0] || null;
}

function getContentPlatform(signal) {
  if (signal.group === "social") return "LinkedIn Article";
  if (signal.group === "reviews") return "Blog + Review Proof";
  if (signal.group === "website") return "Comparison Landing Page";
  return "Blog / SEO";
}

function getContentTitle(signal, index) {
  const short = shortName(signal.competitor);
  const theme = extractTheme(signal);
  if (signal.group === "social") return `${short}'s ${theme} narrative needs a direct executive response`;
  if (signal.group === "reviews") return `What ${short} reviews still reveal about ${theme}`;
  if (signal.group === "website") return `${short}'s ${theme} message needs a workload-fit counter page`;
  return `${capitalize(theme)} for enterprise teams: a Netezza response to ${short}`;
}

function buildContentOutline(signal, platform, title) {
  return `DRAFT OUTLINE - ${platform}\n\nWorking title: ${title}\n\nWhy now\n- Latest source: ${signal.competitor} ${signal.sourceLabel}\n- Fresh signal: ${clipText(signal.summary, 150)}\n\nSection 1 - What ${signal.competitor} is telling the market\nSection 2 - Why that message overreaches for governed enterprise analytics\nSection 3 - Where Netezza should redirect the evaluation\n- Hybrid deployment control\n- Predictable economics\n- SQL-first simplicity\n- IBM trust for regulated workloads\nSection 4 - Questions buyers should ask before following the competitor narrative\n\nPublishing guidance\n- Platform: ${platform}\n- Primary CTA: Book a Netezza architecture briefing\n- Reuse: seller snippet + social post + comparison slide`;
}

function buildBattleCardOutline(signal) {
  return `OUTLINE - Battle card\n\nCompetitive source\n- ${signal.competitor} ${signal.sourceLabel}\n- ${clipText(signal.summary, 140)}\n\nSection 1 - When Netezza wins\nSection 2 - Where ${signal.competitor} is strongest right now\nSection 3 - Landmines to use carefully\nSection 4 - Objection handlers\nSection 5 - Proof points to include\n- Hybrid / on-prem control\n- Predictable query performance\n- Cost clarity\n- Governance for regulated teams\n\nField action\n- Refresh seller talk track this week\n- Add one quote or screenshot from the live source page`;
}

function buildCounterPostOutline(signal) {
  return `OUTLINE - Executive counter-post\n\nOpening line\n- Acknowledge the market narrative without repeating it verbatim.\n\nPoint 1\n- What ${signal.competitor} is trying to make inevitable: ${extractTheme(signal)}\n\nPoint 2\n- Why enterprise buyers still need governed structured analytics\n\nPoint 3\n- Where Netezza is intentionally different\n- Hybrid deployment\n- SQL-first teams\n- Predictable economics\n- IBM trust and compliance posture\n\nClosing CTA\n- Ask buyers which workload, risk, or control requirement is actually driving the decision.\n\nReference source\n- ${signal.sourceUrl}`;
}

function getResponseRecommendation(signal) {
  if (signal.group === "reviews") {
    return `Use ${shortName(signal.competitor)}'s review language to contrast Netezza's workload-fit clarity, especially around cost, complexity, and buyer confidence.`;
  }
  if (signal.group === "social") {
    return `Answer the social narrative with a short executive POV and a seller-ready one-pager before the theme settles into active deals.`;
  }
  if (signal.group === "website") {
    return `Publish a comparison page that breaks the website claim into buyer questions Netezza can answer more credibly.`;
  }
  return `Convert the signal into one thought-leadership asset and one field rebuttal so PMM and sales stay aligned.`;
}

function getActionFromSignal(signal) {
  if (signal.group === "social") return `Respond on ${signal.sourceLabel}`;
  if (signal.group === "reviews") return `Turn the review theme into field proof`;
  if (signal.group === "website") return "Analyze and counter the page";
  return "View and counter the content";
}

function getIconForGroup(group) {
  return {
    social: "!",
    reviews: "$",
    website: "[]",
    blog: "+",
  }[group] || "*";
}

function extractTheme(signal) {
  const summary = `${signal.headline || ""} ${signal.summary || ""}`.toLowerCase();
  if (matches(summary, ["cost", "price", "economics", "billing"])) return "cost predictability";
  if (matches(summary, ["ai", "agent", "genai", "ml", "model"])) return "AI-led modernization";
  if (matches(summary, ["migration", "modernization", "decommission"])) return "migration acceleration";
  if (matches(summary, ["governance", "compliance", "regulated", "trust"])) return "governed enterprise analytics";
  if (matches(summary, ["performance", "fast", "speed", "query"])) return "performance certainty";
  if (matches(summary, ["share", "marketplace", "ecosystem"])) return "ecosystem expansion";
  return "structured analytics decisions";
}

function countKeywords(text, keywords) {
  return keywords.reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function matches(text, keywords) {
  return countKeywords(text, keywords) > 0;
}

function parseGapScore(value) {
  return Number.parseFloat(String(value).split("/")[0]) || 0;
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function dedupeStrings(items) {
  return [...new Set(items.filter(Boolean))];
}

function shortName(name) {
  return COMPETITOR_SHORT[name] || name;
}

function clipText(text, length) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length <= length ? clean : `${clean.slice(0, length - 3).trim()}...`;
}

function hoursSince(value) {
  return (Date.now() - new Date(value).getTime()) / 36e5;
}

function capitalize(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
