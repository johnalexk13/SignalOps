const STORAGE_KEY = "ibm-netezza-product-marketing-insights-v1";
const MARKET_REFRESH_INTERVAL_MS = 90 * 1000;
const COMMUNITY_REFRESH_INTERVAL_MS = 60 * 1000;
const STATIC_WORKSPACE_INTELLIGENCE_ENDPOINT = "./data/workspace-intelligence.json";
const PMM_PAGE_IDS = ["overview", "content", "events", "market", "product", "positioning", "manage"];
const COMMUNITY_PAGE_IDS = ["community-announcements", "community-thought-leadership", "community-replies", "community-manage"];

const SECTION_CONFIG = {
  pmm: {
    title: "Competitive Intelligence",
    eyebrow: "",
    headerTitle: "SignalOps: Market & Community Intelligence Platform",
    headerCopy: "Compare Netezza with the competitor set, curate source feeds, and turn market activity into content, PMM asset, product, and positioning actions.",
    noteLabel: "Workspace behavior",
    noteCopy: "Source URLs can be edited inline and saved locally in the browser. Filters and the last page you visited also persist locally.",
  },
  community: {
    title: "Community Intelligence",
    eyebrow: "",
    headerTitle: "SignalOps: Market & Community Intelligence Platform",
    headerCopy: "Identify the right communities and groups to engage with IBM Netezza announcements, releases, and thought leadership at the right time.",
    noteLabel: "Engagement model",
    noteCopy: "Use live community signals to find where warehouse, lakehouse, and analytics conversations are happening, then tune the keyword focus list as priorities change.",
  },
};

const COMMUNITY_HUBS = [
  { name: "LinkedIn", value: "Groups + posts", description: "Professional communities where announcements, POV posts, and enterprise release notes can land well" },
  { name: "Reddit", value: "Subreddits", description: "Practitioner discussions around warehouses, lakehouses, analytics operations, and architecture trade-offs" },
  { name: "Hacker News", value: "Threads", description: "Launch reactions and category debates among technical decision-makers" },
  { name: "GitHub", value: "Discussions", description: "Engineering-led conversations tied to tooling, integrations, and migration blockers" },
  { name: "Discord", value: "Servers", description: "Modern practitioner communities with fast-moving discussion around tooling and platform choices" },
  { name: "Stack Overflow", value: "Questions", description: "Technical problem statements and troubleshooting patterns tied to warehouse usage" },
  { name: "X", value: "Threads", description: "Fast-moving public narratives around launches, comparisons, and architecture opinion" },
];

const COMMUNITY_PAGES = [
  {
    id: "community-announcements",
    order: 1,
    title: "Best for announcements",
    badge: "Page 1",
    tone: "market",
    description: "The communities, groups, and discussion pages where IBM Netezza launches, release notes, and announcements should be shared at the right moment.",
  },
  {
    id: "community-thought-leadership",
    order: 2,
    title: "Best for thought leadership",
    badge: "Page 2",
    tone: "content",
    description: "The communities and discussion threads best suited for category POVs, architecture guidance, and broader IBM Netezza narrative framing.",
  },
  {
    id: "community-replies",
    order: 3,
    title: "Best for direct engagement replies",
    badge: "Page 3",
    tone: "events",
    description: "The communities where the best move is a contextual reply, follow-up comment, or thread-native proof point rather than a broad post.",
  },
  {
    id: "community-manage",
    order: 4,
    title: "Manage",
    badge: "Page 4",
    tone: "positioning",
    description: "Maintain the keyword focus areas used to discover and monitor communities tied to warehousing, lakehouse, and high-performance analytics conversations.",
  },
];
const DEFAULT_COMMUNITY_KEYWORDS = [
  "data warehouse",
  "lakehouse",
  "high performance analytics",
  "OLAP",
  "MPP database",
  "query performance",
  "warehouse modernization",
  "analytics cost optimization",
  "Snowflake vs BigQuery vs Netezza",
  "ETL / ELT pipelines",
];

const DEFAULT_COMMUNITY_PLATFORMS = [
  "LinkedIn",
  "Reddit",
  "Hacker News",
  "GitHub",
  "Discord",
  "Stack Overflow",
  "X",
];

const COMMUNITY_SIGNAL_GROUPS = [
  {
    community: "LinkedIn",
    play: "announcements",
    group: "Enterprise Data Warehousing & Analytics",
    audience: "Data architects, analytics leaders, platform owners",
    fit: "Strong fit for release announcements and thought-leadership posts tied to enterprise warehouses.",
    discussions: [
      {
        title: "Data warehouse modernization in 2026",
        signal: "Architects are discussing whether lakehouse momentum is replacing classic warehouse patterns or just broadening the stack.",
        content: "Best moment to share a Netezza point of view on workload-fit architecture, governed analytics, and predictable performance.",
        url: "https://www.linkedin.com/search/results/content/?keywords=data%20warehouse%20modernization",
      },
      {
        title: "High-performance analytics for regulated workloads",
        signal: "Senior practitioners are looking for performance plus governance, especially in BFSI and public-sector contexts.",
        content: "Good window for Netezza release proof and IBM-trust positioning.",
        url: "https://www.linkedin.com/search/results/content/?keywords=high-performance%20analytics",
      },
      {
        title: "Lakehouse vs warehouse strategy posts",
        signal: "Leaders are debating whether lakehouse adoption changes the warehouse story or simply expands architecture choices.",
        content: "Useful for sharing an IBM Netezza perspective on workload-fit, control, and hybrid analytics.",
        url: "https://www.linkedin.com/search/results/content/?keywords=lakehouse%20vs%20data%20warehouse",
      },
      {
        title: "Warehouse cost and modernization conversations",
        signal: "Comments and posts increasingly focus on how modernization affects cost predictability and migration complexity.",
        content: "Strong timing for Netezza economics messaging or release posts that support controlled modernization.",
        url: "https://www.linkedin.com/search/results/content/?keywords=analytics%20cost%20optimization",
      },
    ],
  },
  {
    community: "Reddit",
    play: "replies",
    group: "r/dataengineering",
    audience: "Hands-on data engineers and technical evaluators",
    fit: "High-signal discussion space for tooling comparisons, migration pain, and warehouse cost concerns.",
    discussions: [
      {
        title: "Snowflake vs BigQuery vs Redshift discussions",
        signal: "Practitioners compare cost, scale, ergonomics, and operational complexity in active threads.",
        content: "Use this as an early warning surface for where Netezza comparison content or release commentary could resonate.",
        url: "https://www.reddit.com/r/dataengineering/search/?q=data%20warehouse&restrict_sr=1",
      },
      {
        title: "Warehouse performance and scaling pain",
        signal: "Engineers share real-world issues around query speed, concurrency, and spend control.",
        content: "Opportunity to engage with workload-fit guidance rather than direct promotion.",
        url: "https://www.reddit.com/r/dataengineering/search/?q=query%20performance&restrict_sr=1",
      },
      {
        title: "Lakehouse and warehouse architecture debates",
        signal: "Subreddit threads regularly surface trade-offs between warehouse simplicity and newer lakehouse patterns.",
        content: "Helpful place to observe when Netezza release or positioning content can answer real architectural concerns.",
        url: "https://www.reddit.com/r/dataengineering/search/?q=lakehouse&restrict_sr=1",
      },
      {
        title: "Analytics cost optimization threads",
        signal: "People are actively asking how to reduce spend without losing performance or governance.",
        content: "Good opportunity to share cost-conscious release proof or follow-up content that speaks to predictable economics.",
        url: "https://www.reddit.com/r/dataengineering/search/?q=cost%20optimization&restrict_sr=1",
      },
    ],
  },
  {
    community: "Hacker News",
    play: "thought-leadership",
    group: "Launch and product discussion threads",
    audience: "Technical decision-makers and infrastructure-minded leaders",
    fit: "Useful for category framing right after product launches, announcements, or opinionated warehouse debates.",
    discussions: [
      {
        title: "Launch reaction threads about data platforms",
        signal: "Comments often reveal what technical buyers actually care about after a launch or release.",
        content: "Good moment to amplify Netezza announcements if the thread is already discussing warehouses, governance, or performance trade-offs.",
        url: "https://hn.algolia.com/?query=data%20warehouse",
      },
      {
        title: "Lakehouse and analytics platform comparison threads",
        signal: "Discussions quickly surface skepticism, enthusiasm, and practical decision criteria after vendor news.",
        content: "Use these threads to understand where IBM messaging should be precise before sharing releases more broadly.",
        url: "https://hn.algolia.com/?query=lakehouse",
      },
      {
        title: "Performance and scaling conversations",
        signal: "Threads about high-scale data systems often reveal what infrastructure-minded leaders see as credible differentiation.",
        content: "Useful for tailoring Netezza release framing around performance certainty and workload fit.",
        url: "https://hn.algolia.com/?query=query%20performance",
      },
    ],
  },
  {
    community: "GitHub",
    play: "replies",
    group: "dbt and data tooling discussions",
    audience: "Engineers shaping tooling and workflow decisions",
    fit: "Good for spotting migration blockers and integration needs that can inform how Netezza releases are framed.",
    discussions: [
      {
        title: "Warehouse integration and migration issues",
        signal: "Open issues and discussion boards highlight what practitioners struggle to operationalize.",
        content: "Useful for knowing when to share release notes, connectors, or compatibility messaging.",
        url: "https://github.com/search?q=data+warehouse+discussion&type=discussions",
      },
      {
        title: "dbt and transformation workflow discussions",
        signal: "Engineering conversations show where teams are struggling with platform fit, orchestration, and warehouse interoperability.",
        content: "Good source for identifying where a Netezza release or integration update would be relevant.",
        url: "https://github.com/search?q=dbt+warehouse+discussion&type=discussions",
      },
      {
        title: "Lakehouse tooling and open-table issues",
        signal: "Repository discussions often expose the real integration friction behind modern data stack choices.",
        content: "Useful when deciding how to package Netezza compatibility, modernization, and architecture content.",
        url: "https://github.com/search?q=lakehouse+discussion&type=discussions",
      },
    ],
  },
  {
    community: "Discord",
    play: "replies",
    group: "Data engineering and analytics community servers",
    audience: "Modern practitioners, data platform builders, analytics engineers",
    fit: "Good for fast-moving release awareness and for spotting where practitioners ask for platform recommendations in real time.",
    discussions: [
      {
        title: "Warehouse and lakehouse recommendation channels",
        signal: "Members ask for practical recommendations when choosing between warehouse, lakehouse, and hybrid stack options.",
        content: "Useful for timing IBM Netezza thought leadership or release awareness when the question is already active.",
        url: "https://disboard.org/servers/tag/data-engineering",
      },
      {
        title: "Analytics performance troubleshooting rooms",
        signal: "Communities share live troubleshooting around performance, cost, orchestration, and workload placement.",
        content: "Helpful for shaping how Netezza release messaging speaks to actual practitioner pain.",
        url: "https://disboard.org/servers/tag/analytics",
      },
      {
        title: "Modern data stack community channels",
        signal: "Threads often move quickly between tooling comparisons, implementation issues, and architecture advice.",
        content: "Best used as an early warning surface for when a release or announcement could fit an ongoing discussion.",
        url: "https://disboard.org/servers/tag/data",
      },
    ],
  },
  {
    community: "Stack Overflow",
    play: "replies",
    group: "Warehouse and analytics problem discussions",
    audience: "Hands-on implementers, data engineers, platform troubleshooters",
    fit: "Best for understanding the exact technical language people use when warehouses, performance, and scaling become painful.",
    discussions: [
      {
        title: "Data warehouse tagged questions",
        signal: "Question threads surface recurring implementation issues and platform selection pain points.",
        content: "Useful for seeing where Netezza release messaging should emphasize clarity, compatibility, or operational simplicity.",
        url: "https://stackoverflow.com/questions/tagged/data-warehouse",
      },
      {
        title: "OLAP and analytics performance questions",
        signal: "Teams often ask about scaling, optimization, and warehouse behavior in production workloads.",
        content: "Good moment to observe where Netezza high-performance analytics proof could resonate.",
        url: "https://stackoverflow.com/questions/tagged/olap",
      },
      {
        title: "ETL / ELT pipeline and warehouse design questions",
        signal: "Practitioners reveal where operational friction affects architecture and warehouse decisions.",
        content: "Helpful for shaping release communications around integration and ease of adoption.",
        url: "https://stackoverflow.com/questions/tagged/etl",
      },
    ],
  },
  {
    community: "X",
    play: "announcements",
    group: "Public data platform and analytics threads",
    audience: "Influencers, architects, vendor watchers, technical practitioners",
    fit: "Strong for spotting emerging narratives and knowing when a Netezza launch or announcement should join an already-visible conversation.",
    discussions: [
      {
        title: "Data warehouse narrative threads",
        signal: "Public posts and threaded debate capture where attention is moving in the warehouse category.",
        content: "Good for right-time amplification of announcements when category attention spikes.",
        url: "https://x.com/search?q=%22data%20warehouse%22&src=typed_query",
      },
      {
        title: "Lakehouse comparison conversations",
        signal: "Platform advocates and practitioners compare lakehouse and warehouse approaches in public and fast-moving threads.",
        content: "Useful for sharing short Netezza POV responses when comparisons are already active.",
        url: "https://x.com/search?q=lakehouse%20warehouse&src=typed_query",
      },
      {
        title: "Analytics performance and cost posts",
        signal: "Users call out cost surprises, scaling concerns, and architecture trade-offs after vendor changes or launches.",
        content: "Good surface for release follow-ups tied to predictable economics and workload-fit messaging.",
        url: "https://x.com/search?q=analytics%20cost%20optimization&src=typed_query",
      },
    ],
  },
];

const PRODUCT_PROFILE = {
  name: "IBM Netezza Performance Server",
  subtitle: "The product being monitored and compared against competitors",
  usageNote: "All 5 insight types compare competitor activity against this product's positioning, capabilities, and buyer perception to generate Netezza-specific winning recommendations.",
  fields: [
    { label: "Product Name", value: "IBM Netezza Performance Server" },
    { label: "Product Page URL", value: "https://www.ibm.com/products/netezza" },
    { label: "G2 Reviews URL", value: "https://www.g2.com/products/ibm-netezza/reviews" },
    { label: "TrustRadius URL", value: "https://www.trustradius.com/products/ibm-netezza-performance-server/reviews" },
    { label: "Blog / Announcements URL", value: "https://www.ibm.com/new/announcements/netezza-in-2026-powering-the-next-era-of-hybrid-analytics" },
    { label: "LinkedIn Page URL", value: "https://www.linkedin.com/showcase/ibm-netezza/" },
  ],
};

const COMPETITORS = [
  { id: "databricks", name: "Databricks", color: "#e74c3c", pressure: 92, narrative: "AI + lakehouse consolidation" },
  { id: "snowflake", name: "Snowflake", color: "#3498db", pressure: 88, narrative: "Ease, governance, and app velocity" },
  { id: "redshift", name: "Amazon Redshift", color: "#f39c12", pressure: 75, narrative: "AWS-native performance and cost control" },
  { id: "bigquery", name: "Google BigQuery", color: "#27ae60", pressure: 81, narrative: "Integrated AI analytics story" },
  { id: "synapse", name: "Azure Synapse", color: "#9b59b6", pressure: 69, narrative: "Microsoft ecosystem pull" },
  { id: "teradata", name: "Teradata", color: "#e67e22", pressure: 64, narrative: "Scale credibility in complex estates" },
];

const POSITIONING_DIMENSIONS = [
  {
    label: "Hybrid / on-prem deployment",
    netezza: 9.5,
    note: "Keep winning where deployment control, data residency, and regulated workload flexibility matter most.",
    competitors: { Databricks: 4.5, Snowflake: 4.0, "Amazon Redshift": 5.5, "Google BigQuery": 3.0, "Azure Synapse": 4.8, Teradata: 8.0 },
  },
  {
    label: "Predictable query performance",
    netezza: 9.2,
    note: "This remains one of the clearest executive-level reasons to choose Netezza for structured analytics workloads.",
    competitors: { Databricks: 6.5, Snowflake: 7.4, "Amazon Redshift": 6.8, "Google BigQuery": 7.8, "Azure Synapse": 6.9, Teradata: 8.1 },
  },
  {
    label: "Regulated industry compliance",
    netezza: 9.1,
    note: "Anchor IBM trust, security posture, and deployment flexibility in BFSI, healthcare, and public-sector evaluations.",
    competitors: { Databricks: 6.0, Snowflake: 7.0, "Amazon Redshift": 7.1, "Google BigQuery": 5.2, "Azure Synapse": 7.6, Teradata: 8.0 },
  },
  {
    label: "SQL-first simplicity for analysts",
    netezza: 9.0,
    note: "Use this whenever buyers are frustrated by engineering-heavy architectures or too many platform layers.",
    competitors: { Databricks: 5.5, Snowflake: 8.2, "Amazon Redshift": 7.0, "Google BigQuery": 7.5, "Azure Synapse": 6.8, Teradata: 7.2 },
  },
  {
    label: "TCO predictability",
    netezza: 8.8,
    note: "Economic clarity and cost control are still fertile ground versus cloud-first alternatives.",
    competitors: { Databricks: 5.0, Snowflake: 5.5, "Amazon Redshift": 5.8, "Google BigQuery": 6.1, "Azure Synapse": 6.0, Teradata: 6.2 },
  },
  {
    label: "AI / ML ecosystem",
    netezza: 7.0,
    note: "This is the biggest relative gap, so the platform story needs sharper proof, packaging, and partner language.",
    competitors: { Databricks: 9.5, Snowflake: 8.5, "Amazon Redshift": 7.4, "Google BigQuery": 8.8, "Azure Synapse": 7.9, Teradata: 6.5 },
  },
];

const MESSAGE_PILLARS = [
  { tone: "pillar-content", title: "Performance certainty", text: "Position Netezza as the structured analytics platform that delivers speed without cloud-billing drama or platform sprawl." },
  { tone: "pillar-events", title: "Hybrid freedom", text: "Make deployment flexibility central whenever the evaluation includes sovereignty, residency, or infrastructure control requirements." },
  { tone: "pillar-market", title: "Predictable economics", text: "Use cost stories, NCOS proof, and governance-friendly economics to neutralize cloud-first pricing narratives." },
  { tone: "pillar-product", title: "Regulated-ready trust", text: "Turn IBM credibility into a specific narrative for compliance-heavy, risk-sensitive analytics environments." },
  { tone: "pillar-positioning", title: "SQL-first simplicity", text: "Highlight operational simplicity and analyst productivity when competitors drift toward engineering-heavy platform messaging." },
];

const POSITIONING_RECOMMENDATION = {
  label: "AI positioning recommendation",
  statement: "The enterprise SQL data warehouse for teams that need predictable performance, hybrid flexibility, and governed structured analytics without the complexity of a lakehouse.",
  evidence: "Use Databricks complexity, Snowflake cost pressure, and BigQuery's cloud-first bias as proof points that Netezza can still own the structured analytics brief for regulated and hybrid enterprise buyers.",
};

const CONTENT_IDEA_ALERT = {
  title: "Urgent: Databricks counter-narrative needed within 7 days",
  copy: "The 'death of the data warehouse' narrative is gaining enterprise mindshare. Publish a counter-post and begin the lakehouse-vs-DW decision framework before end of this week.",
};

const CONTENT_IDEAS = [
  {
    id: "content-idea-warehouse-evolved",
    icon: "!",
    title: "The data warehouse isn't dead - it's evolved",
    summary: "Direct counter to Databricks' CEO viral LinkedIn post. Reframe structured analytics as intentional enterprise architecture, not legacy. Target CDOs and data architects.",
    platform: "LinkedIn Article",
    status: "Urgent",
    tags: ["LinkedIn article", "Counter-Databricks", "CDO persona", "Publish within 7 days"],
    outline: `DRAFT OUTLINE - LinkedIn Article

Hook: "The data warehouse is dead." I've heard this for 15 years.

Paragraph 1 - Acknowledge the Databricks narrative. Don't dismiss it.
Paragraph 2 - What are enterprises actually doing?
- Fortune 500 teams still run structured analytics for regulated workloads.
- Those teams are not "legacy"; they are choosing control and consistency.
Paragraph 3 - What structured DW gives you that a lakehouse doesn't:
- Predictable query SLAs
- Governance built in, not bolted on
- SQL-first access for analyst teams
- More stable economics for repeat workloads
Paragraph 4 - The right architecture depends on the workload.
- Lakehouse is one choice, not the only choice.
- DW plus hybrid flexibility is a deliberate strategy.

Closing CTA: What is driving your architecture decisions right now?

Suggested hashtags: #DataWarehouse #EnterpriseAnalytics #IBMNetezza #DataStrategy`,
  },
  {
    id: "content-idea-decision-framework",
    icon: "[]",
    title: "Lakehouse vs data warehouse - a decision framework for enterprise teams",
    summary: "Neutral-framed comparison that guides enterprise buyers. Captures Databricks-vs-Netezza evaluation searches and positions Netezza for structured, governed, BI-heavy workloads.",
    platform: "Blog / SEO",
    status: "New",
    tags: ["Blog / SEO", "Counter-Databricks", "Evaluation stage"],
    outline: `DRAFT OUTLINE - Blog / SEO

Working title: Lakehouse vs Data Warehouse: Which model fits your enterprise workload?

Section 1 - Why this decision matters in 2026
Section 2 - What lakehouse platforms are optimized for
Section 3 - Where classic structured warehouse patterns still win
Section 4 - A decision matrix:
- Regulated analytics
- BI-heavy teams
- Cost predictability needs
- Hybrid deployment requirements
Section 5 - When Netezza is the better fit

SEO angle: capture evaluation searches from buyers comparing lakehouse momentum to governed analytics reality.

CTA: Download the enterprise workload fit checklist.`,
  },
  {
    id: "content-idea-tco-analysis",
    icon: "$",
    title: "The real TCO of cloud-only data warehouses - 2026 analysis",
    summary: "Counter Snowflake, Redshift, and Databricks 'low entry cost' narrative. Use G2 review data showing cost complaints. Includes Databricks DBU cost unpredictability angle.",
    platform: "Blog and LinkedIn",
    status: "",
    tags: ["Blog / LinkedIn", "Counter-Snowflake", "Counter-Databricks", "High priority"],
    outline: `DRAFT OUTLINE - Blog + LinkedIn Promotion

Section 1 - Why list-price comparisons hide the real cost story
Section 2 - What review themes say about spend predictability
Section 3 - Query-cost variability, credits, DBUs, and operational overhead
Section 4 - How Netezza positions predictable economics differently
Section 5 - Questions finance and analytics leaders should ask vendors

Supporting proof:
- Review-site quotes about surprise cost growth
- Examples of workload volatility
- IBM narrative on economic clarity

CTA: Request the executive cost-pressure briefing.`,
  },
  {
    id: "content-idea-regulated-industries",
    icon: "#",
    title: "Why regulated industries cannot afford a lakehouse-first strategy",
    summary: "Targets BFSI, healthcare, and government personas. Compliance and data sovereignty arguments hit hardest here. Covers Databricks, BigQuery, and Snowflake gaps.",
    platform: "Whitepaper",
    status: "",
    tags: ["Whitepaper", "BFSI / Healthcare", "Counter-Databricks", "Counter-BigQuery"],
    outline: `DRAFT OUTLINE - Whitepaper

Executive summary - Regulated analytics decisions are architecture decisions.

Chapter 1 - Where cloud-first narratives oversimplify regulated workload needs
Chapter 2 - Deployment control, residency, and auditability requirements
Chapter 3 - Why predictable performance matters for regulated reporting
Chapter 4 - The case for hybrid analytics architectures
Chapter 5 - Positioning Netezza for trust, control, and speed

Distribution plan:
- Gated asset on ibm.com
- Follow-up webinar
- Sales enablement leave-behind`,
  },
  {
    id: "content-idea-analysts-deserve-better",
    icon: "@",
    title: "Your data analysts deserve better than a lakehouse",
    summary: "Persona-driven piece targeting BI leads frustrated by Databricks SQL complexity. Champions SQL-native teams. Highly shareable in analytics practitioner communities.",
    platform: "Blog",
    status: "",
    tags: ["Blog", "Counter-Databricks", "BI lead persona"],
    outline: `DRAFT OUTLINE - Blog

Opening: Analysts should not need a data engineering degree to answer business questions.

Section 1 - Where engineering-heavy stacks slow analytics teams down
Section 2 - SQL-first simplicity as a productivity advantage
Section 3 - What buyer reviews say about complexity friction
Section 4 - Why Netezza is designed for structured analytics teams

CTA: Share the analyst productivity checklist with your BI team.`,
  },
  {
    id: "content-idea-hybrid-strategy",
    icon: "+",
    title: "Hybrid data architecture is not a compromise - it's a strategy",
    summary: "Response to Teradata-Databricks partnership signals. Positions hybrid as intentional enterprise architecture choice for CTO audiences. Counters both from one angle.",
    platform: "LinkedIn Article",
    status: "",
    tags: ["LinkedIn article", "Counter-Teradata", "Counter-Databricks", "CTO persona"],
    outline: `DRAFT OUTLINE - LinkedIn Article

Opening argument: Hybrid is not transitional. For many enterprises it is the target state.

Paragraph 1 - Why blanket cloud-only narratives miss enterprise reality
Paragraph 2 - The operational benefits of choosing workload-fit architecture
Paragraph 3 - Where hybrid control supports security, governance, and migration pacing
Paragraph 4 - Position Netezza as deliberate architecture, not compromise

CTA: How are you balancing flexibility and control across your data estate?`,
  },
  {
    id: "content-idea-review-proof-pack",
    icon: "$",
    title: "What buyer reviews say when cloud warehouse economics stop making sense",
    summary: "Turns cost, billing variability, and operations friction themes from G2 and TrustRadius into a proof-led Netezza perspective for finance-conscious buyers.",
    platform: "Blog / Sales Enablement",
    status: "",
    tags: ["Review proof", "Counter-Snowflake", "Counter-Redshift", "Cost narrative"],
    outline: `DRAFT OUTLINE - Blog / Sales Enablement

Opening: Buyers do not experience platform economics as a pricing table. They experience them as surprises, friction, and trade-offs.

Section 1 - Which review themes keep appearing across cloud data warehouse alternatives
Section 2 - How cost unpredictability changes evaluation behavior
Section 3 - Where Netezza can speak more credibly about controlled economics
Section 4 - The proof points sales should use in active deals

CTA: Download the cost-objection rebuttal sheet.`,
  },
  {
    id: "content-idea-governed-ai",
    icon: "!",
    title: "Governed AI for analytics teams starts with governed data foundations",
    summary: "Counters Databricks and BigQuery AI-led narratives by reframing the conversation around governed structured analytics, trust, and operational fit.",
    platform: "Executive POV Post",
    status: "New",
    tags: ["AI narrative", "Counter-Databricks", "Counter-BigQuery", "Executive POV"],
    outline: `DRAFT OUTLINE - Executive POV Post

Opening: AI acceleration without data control creates new enterprise risk, not just new productivity.

Point 1 - Why governed data foundations still matter in the AI buying cycle
Point 2 - Where cloud-first AI messaging overreaches
Point 3 - How Netezza fits teams that need auditability, performance, and control
Point 4 - Questions executives should ask before following AI platform momentum

CTA: Book a governed analytics strategy session.`,
  },
  {
    id: "content-idea-sql-productivity",
    icon: "@",
    title: "Why SQL-first analytics teams still outperform over-engineered data stacks",
    summary: "Targets BI leaders and analytics managers who want speed and consistency without the complexity burden of engineering-heavy lakehouse patterns.",
    platform: "Blog",
    status: "",
    tags: ["BI productivity", "Counter-Databricks", "SQL-first", "Practitioner audience"],
    outline: `DRAFT OUTLINE - Blog

Opening: Analytics speed depends as much on team fit as it does on platform capability.

Section 1 - Where over-engineered architectures slow down business analytics
Section 2 - The productivity advantages of SQL-first governed workflows
Section 3 - The evaluation questions BI leaders should ask vendors
Section 4 - How Netezza supports structured analytics teams more directly

CTA: Share the workload-fit checklist with your analytics team.`,
  },
  {
    id: "content-idea-migration-risk",
    icon: "[]",
    title: "Cloud migration stories rarely mention operational risk - buyers should ask anyway",
    summary: "Counters Redshift and cloud-only modernization narratives by focusing on migration friction, workload disruption, and governance trade-offs.",
    platform: "Comparison Landing Page",
    status: "",
    tags: ["Migration", "Counter-Redshift", "Counter-BigQuery", "Comparison page"],
    outline: `DRAFT OUTLINE - Comparison Landing Page

Headline: Modernization should reduce risk, not rename it.

Section 1 - What vendors highlight in migration success stories
Section 2 - Which operational questions buyers often forget to ask
Section 3 - Why workload-fit architecture matters more than blanket cloud narratives
Section 4 - Where Netezza fits enterprises with control and continuity requirements

CTA: Request the migration-risk evaluation checklist.`,
  },
  {
    id: "content-idea-regulated-checklist",
    icon: "#",
    title: "A regulated analytics platform checklist for BFSI, healthcare, and public sector teams",
    summary: "Transforms Netezza's compliance and deployment-control strengths into a concrete buyer checklist that counters general-purpose cloud-first messaging.",
    platform: "Checklist / Gated Asset",
    status: "",
    tags: ["Regulated industries", "Checklist", "BFSI / Healthcare", "Lead generation"],
    outline: `DRAFT OUTLINE - Checklist / Gated Asset

Section 1 - Data residency and sovereignty requirements
Section 2 - Auditability and performance expectations
Section 3 - Deployment control and migration pacing
Section 4 - Cost and governance evaluation criteria
Section 5 - Vendor questions for regulated analytics workloads

CTA: Download the regulated analytics checklist.`,
  },
  {
    id: "content-idea-ecosystem-story",
    icon: "+",
    title: "Open table formats are useful - but they are not the whole buying decision",
    summary: "Responds to Snowflake and Databricks ecosystem messaging by repositioning the conversation around workload fit, governance, and production outcomes.",
    platform: "LinkedIn Article",
    status: "",
    tags: ["Open table formats", "Counter-Databricks", "Counter-Snowflake", "Ecosystem narrative"],
    outline: `DRAFT OUTLINE - LinkedIn Article

Opening: Open ecosystem compatibility matters, but it is not the same as workload success.

Paragraph 1 - Where ecosystem narratives help buyers
Paragraph 2 - Where they can distract from operating requirements
Paragraph 3 - Why buyers should still test governance, economics, and performance
Paragraph 4 - How Netezza should frame compatibility inside a bigger enterprise story

CTA: Which buying criteria are still underweighted in your evaluations?`,
  },
  {
    id: "content-idea-cfo-brief",
    icon: "=",
    title: "A CFO brief on predictable analytics economics vs usage-driven platform drift",
    summary: "Creates an executive-ready finance angle for deals where Snowflake, Databricks, or BigQuery are being framed as more modern despite cost volatility concerns.",
    platform: "Executive Brief",
    status: "",
    tags: ["CFO persona", "Economics", "Counter-Snowflake", "Counter-Databricks"],
    outline: `DRAFT OUTLINE - Executive Brief

Section 1 - Why analytics platform economics become a finance issue
Section 2 - Where usage-driven models create unpredictability
Section 3 - What finance leaders should ask in late-stage evaluations
Section 4 - How Netezza should frame cost control and planning confidence

CTA: Request the executive economics briefing.`,
  },
  {
    id: "content-idea-seller-proof",
    icon: "^",
    title: "From market narrative to field proof: 10 rebuttals sellers need this quarter",
    summary: "Converts the latest competitor messaging into field-ready rebuttal content that marketing can publish and sales can reuse in live deals.",
    platform: "Enablement Pack",
    status: "",
    tags: ["Sales enablement", "Quarterly", "Field proof", "PMM reuse"],
    outline: `DRAFT OUTLINE - Enablement Pack

Section 1 - The 10 competitor narratives appearing most often right now
Section 2 - The Netezza response for each narrative
Section 3 - Proof links and customer-language examples
Section 4 - How marketing and sales should reuse the same content assets

CTA: Open the rebuttal pack for this quarter's active deals.`,
  },
];

const PMM_ACTION_ALERT = {
  title: "Urgent PMM actions - Databricks threat",
  copy: "Two immediate actions needed: (1) publish a LinkedIn counter-post to Databricks' CEO 'death of DW' narrative within 7 days, and (2) create the Netezza vs Databricks battle card before month-end because enterprise DW deal registrations are at risk.",
};

const PMM_ACTIONS = [
  {
    id: "pmm-battlecard-databricks",
    icon: "X",
    title: "Battle card: Netezza vs Databricks",
    summary: "Full competitive card with positioning, landmines, and objection handlers.",
    status: "Urgent",
    outline: `OUTLINE - Battle card: Netezza vs Databricks

Section 1 - Executive summary
- When Netezza wins
- When Databricks wins
- Why this battle matters now

Section 2 - Core positioning
- Netezza: predictable structured analytics, hybrid flexibility, governed performance
- Databricks: AI + lakehouse consolidation, but more stack complexity

Section 3 - Databricks landmines to use carefully
- "Death of the warehouse" narrative is too broad for regulated buyers
- Complexity burden on analyst-heavy teams
- Cost and architecture sprawl concerns in review language

Section 4 - Objection handlers
- "We need AI momentum"
- "Lakehouse is the future"
- "Databricks feels more modern"

Section 5 - Proof to include
- SQL-first simplicity
- Regulated-workload fit
- TCO predictability

Closing asset note: keep this seller-ready, punchy, and easy to scan in a live deal.`,
  },
  {
    id: "pmm-battlecard-snowflake",
    icon: "X",
    title: "Battle card: Netezza vs Snowflake",
    summary: "Positioning, objection handlers, and landmines for Snowflake-led deals.",
    status: "",
    outline: `OUTLINE - Battle card: Netezza vs Snowflake

Section 1 - Competitive framing
Section 2 - Where Snowflake is strongest
Section 3 - Where Netezza should counter
- Economics and predictability
- Hybrid and on-prem flexibility
- Governance and performance certainty

Section 4 - Likely objections
- Ease of use
- Ecosystem breadth
- Cloud-first buying momentum

Section 5 - Deal guidance
- Which personas to target
- Which proof points matter most
- When to avoid feature-parity debates`,
  },
  {
    id: "pmm-battlecard-redshift",
    icon: "X",
    title: "Battle card: Netezza vs Redshift",
    summary: "Positioning, objection handlers, and landmines for AWS-native comparisons.",
    status: "",
    outline: `OUTLINE - Battle card: Netezza vs Redshift

Section 1 - AWS advantage vs workload-fit reality
Section 2 - Netezza message for hybrid enterprises
Section 3 - Redshift objection handling
- AWS alignment
- Scale claims
- Price-performance messaging

Section 4 - Landmines
- Cross-estate simplicity
- Governance and deployment freedom
- Regulated workload requirements

Section 5 - Seller talk track for infrastructure-led buyers`,
  },
  {
    id: "pmm-counterpost-databricks",
    icon: "!",
    title: "Counter-post: Databricks 'death of DW' narrative",
    summary: "LinkedIn executive post ready to publish in a VP of Product voice.",
    status: "Urgent",
    outline: `OUTLINE - LinkedIn counter-post

Opening line: The data warehouse is not dead. Bad architecture decisions are.

Paragraph 1 - Acknowledge why the lakehouse story resonates
Paragraph 2 - Explain why structured analytics still matters for real enterprise workloads
Paragraph 3 - Make the case for governed, hybrid, SQL-first architecture
Paragraph 4 - Position Netezza as deliberate enterprise design, not legacy

Close with one provocative question for engagement.

Optional assets:
- pull-quote tile
- 3-slide carousel
- internal seller version of the same message`,
  },
  {
    id: "pmm-win-story-bfsi",
    icon: "*",
    title: "Win story: BFSI customer vs Databricks",
    summary: "Template for sales and marketing use in regulated account motion.",
    status: "New",
    outline: `OUTLINE - BFSI win story

Section 1 - Customer context
- Industry
- Data sensitivity
- Workload type

Section 2 - Why Databricks looked attractive initially
Section 3 - What concerns emerged
- Compliance
- Architecture complexity
- Cost predictability

Section 4 - Why Netezza won
- Governed performance
- Deployment control
- Lower operational burden

Section 5 - Reusable proof points for field and web`,
  },
  {
    id: "pmm-cio-briefing",
    icon: "=",
    title: "CIO briefing: Netezza competitive positioning",
    summary: "Executive-ready narrative versus Snowflake, Redshift, and Databricks.",
    status: "",
    outline: `OUTLINE - CIO briefing

Slide 1 - Why the DW category narrative is shifting
Slide 2 - Competitive landscape snapshot
Slide 3 - Where Netezza leads
Slide 4 - Where the market is loudest right now
Slide 5 - What messaging CIOs should hear from IBM
Slide 6 - Recommended next moves for enterprise accounts

Tone: strategic, concise, board-ready.`,
  },
  {
    id: "pmm-content-calendar",
    icon: "#",
    title: "Q2 2026 content calendar (updated with Databricks)",
    summary: "Full PMM content plan for the current win-in-market motion.",
    status: "",
    outline: `OUTLINE - Q2 2026 content calendar

Month 1
- Databricks counter-narrative post
- Decision framework blog
- Cost-predictability article

Month 2
- Regulated industries whitepaper
- Snowflake economics rebuttal
- Hybrid strategy executive POV

Month 3
- Analyst-facing thought leadership
- Customer proof asset
- Repurposed carousel/social sequence

For each item include:
- owner
- platform
- target persona
- CTA
- reuse plan`,
  },
  {
    id: "pmm-analyst-briefing",
    icon: "^",
    title: "Analyst briefing topics - Gartner / Forrester",
    summary: "Includes lakehouse vs DW narrative positioning and talking points.",
    status: "",
    outline: `OUTLINE - Analyst briefing topics

Theme 1 - Why structured analytics still deserves its own category language
Theme 2 - Hybrid deployment as a strategic requirement, not a transition phase
Theme 3 - Cost predictability and performance certainty as evaluation criteria
Theme 4 - Where lakehouse narratives overreach for regulated buyers
Theme 5 - What IBM wants analysts to understand about Netezza in 2026

Deliverables:
- briefing memo
- 1-page takeaway
- follow-up proof package`,
  },
];

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

const PRODUCT_CRITICAL_GAP = {
  title: "Remaining critical gap - full AI / ML in-database execution and business-user NLQ",
  copy: "Iceberg, NCOS, Time Travel, and the AI Database Assistant are now confirmed shipped or packaged for PMM. The biggest remaining gaps versus Databricks, Snowflake Cortex, and BigQuery are full in-database ML training / inference for data scientists and a broader natural-language query experience for business users.",
};

const PRODUCT_CAPABILITY_MATRIX = [
  {
    capability: "Core SQL analytics",
    note: "Structured query processing",
    statuses: { Netezza: "strong", Databricks: "strong", Snowflake: "strong", "Amazon Redshift": "strong", "Google BigQuery": "strong", "Azure Synapse": "strong", Teradata: "strong" },
    gapScore: 0,
  },
  {
    capability: "Hybrid / on-prem deployment",
    note: "Run-anywhere architecture",
    statuses: { Netezza: "strong", Databricks: "gap", Snowflake: "gap", "Amazon Redshift": "partial", "Google BigQuery": "gap", "Azure Synapse": "partial", Teradata: "strong" },
    gapScore: 0,
  },
  {
    capability: "Enterprise compliance & governance",
    note: "BFSI, healthcare, government fit",
    statuses: { Netezza: "strong", Databricks: "partial", Snowflake: "partial", "Amazon Redshift": "partial", "Google BigQuery": "partial", "Azure Synapse": "partial", Teradata: "strong" },
    gapScore: 0,
  },
  {
    capability: "Native AI / ML model execution",
    note: "watsonx.data integration + custom ML in-engine roadmap",
    statuses: { Netezza: "partial", Databricks: "strong", Snowflake: "strong", "Amazon Redshift": "partial", "Google BigQuery": "strong", "Azure Synapse": "strong", Teradata: "partial" },
    gapScore: 6.5,
  },
  {
    capability: "Natural language querying (NLQ)",
    note: "AI Database Assistant today, broader business NLQ still needed",
    statuses: { Netezza: "partial", Databricks: "strong", Snowflake: "strong", "Amazon Redshift": "partial", "Google BigQuery": "strong", "Azure Synapse": "strong", Teradata: "partial" },
    gapScore: 5.0,
  },
  {
    capability: "Open table format support",
    note: "Apache Iceberg + Unity Catalog / AWS Glue compatibility",
    statuses: { Netezza: "strong", Databricks: "strong", Snowflake: "strong", "Amazon Redshift": "partial", "Google BigQuery": "strong", "Azure Synapse": "partial", Teradata: "partial" },
    gapScore: 0,
  },
  {
    capability: "Serverless auto-scaling",
    note: "NCOS compute-storage separation + pay-as-you-go pattern",
    statuses: { Netezza: "partial", Databricks: "strong", Snowflake: "strong", "Amazon Redshift": "strong", "Google BigQuery": "strong", "Azure Synapse": "partial", Teradata: "partial" },
    gapScore: 4.8,
  },
  {
    capability: "Data sharing marketplace",
    note: "Governed external data exchange",
    statuses: { Netezza: "gap", Databricks: "strong", Snowflake: "strong", "Amazon Redshift": "partial", "Google BigQuery": "strong", "Azure Synapse": "partial", Teradata: "gap" },
    gapScore: 6.5,
  },
  {
    capability: "Real-time / streaming analytics",
    note: "Event-stream ingestion at scale",
    statuses: { Netezza: "gap", Databricks: "strong", Snowflake: "partial", "Amazon Redshift": "partial", "Google BigQuery": "strong", "Azure Synapse": "strong", Teradata: "partial" },
    gapScore: 6.2,
  },
  {
    capability: "Notebook / IDE interface",
    note: "Built-in developer workspace",
    statuses: { Netezza: "partial", Databricks: "strong", Snowflake: "strong", "Amazon Redshift": "partial", "Google BigQuery": "partial", "Azure Synapse": "strong", Teradata: "partial" },
    gapScore: 5.0,
  },
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

const PRODUCT_REMAINING_GAPS = [
  {
    priority: "P1 - Critical",
    title: "Full in-database ML training and inference for data scientists",
    gapScore: "6.5 / 10",
    copy: "Netezza has made progress with watsonx.data integration and the 2026 roadmap now includes custom ML models and unstructured text processing inside the engine. The remaining gap is a fuller in-database ML story for data scientists, where Databricks, Snowflake Cortex, and BigQuery still market more aggressively.",
    current: "watsonx.data integration, Hadoop / Hive / Kerberos connectivity, custom ML in-engine roadmap",
    leverage: "IBM watsonx.ai + watsonx.data + Granite models",
    impact: "CDO, Head of Data Science, Data Architect",
    competitors: ["Databricks MLflow + Runtime", "Snowflake Cortex AI", "BigQuery ML + Vertex AI", "Azure Synapse + OpenAI"],
  },
  {
    priority: "P2 - High",
    title: "Expand NLQ from ops assistant to full business-user query interface",
    gapScore: "5.0 / 10",
    copy: "The AI-powered Database Assistant is a meaningful step forward, but it is still oriented toward DBAs and ops teams. The remaining gap is a natural-language experience that lets business users ask analytical questions directly and get governed SQL-backed answers.",
    current: "AI Database Assistant - NL troubleshooting, metric retrieval, config insights",
    leverage: "IBM watsonx Assistant + Granite LLM + semantic layer",
    impact: "Business Analyst, BI Lead, CDO, CFO",
    competitors: ["Databricks AI / Genie", "Snowflake Cortex Analyst", "BigQuery DataQnA / NLQ", "Synapse + Copilot"],
  },
  {
    priority: "P2 - High",
    title: "Governed data sharing marketplace",
    gapScore: "6.5 / 10",
    copy: "Snowflake Marketplace and Databricks Delta Sharing have become ecosystem moats. Netezza still needs a stronger governed sharing capability that lets customers expose read-only data products across organizations without losing control.",
    current: "Unified metadata management, watsonx.data ecosystem connectivity",
    leverage: "IBM Cloud Pak for Data + IAM governance",
    impact: "CDO, Data Product Owner, Partner ecosystem teams",
    competitors: ["Snowflake Data Marketplace", "Databricks Delta Sharing", "BigQuery Analytics Hub"],
  },
  {
    priority: "P3 - Strategic",
    title: "Real-time streaming analytics ingestion",
    gapScore: "6.2 / 10",
    copy: "Databricks, BigQuery, and Azure Synapse all support stronger streaming and real-time ingestion patterns. Netezza remains optimized for batch analytics, which is fine for many accounts, but a connector-layer streaming story would prevent losses in BFSI and telecom evaluations.",
    current: "Batch-optimized structured analytics with strong governed performance",
    leverage: "IBM Event Streams (Kafka managed) + IBM DataStage",
    impact: "Data Engineer, Platform Architect, BFSI / Telco verticals",
    competitors: ["Databricks Structured Streaming", "BigQuery Streaming + Pub/Sub", "Synapse + Event Hub"],
  },
];

const COMPETITIVE_SENTIMENT = [
  { name: "IBM Netezza", positive: 74, neutral: 17, negative: 9 },
  { name: "Snowflake", positive: 78, neutral: 14, negative: 8 },
  { name: "Databricks", positive: 68, neutral: 17, negative: 15 },
  { name: "Amazon Redshift", positive: 62, neutral: 20, negative: 18 },
  { name: "Google BigQuery", positive: 70, neutral: 18, negative: 12 },
  { name: "Azure Synapse", positive: 65, neutral: 20, negative: 15 },
  { name: "Teradata", positive: 60, neutral: 18, negative: 22 },
];

const INSIGHT_PAGES = [
  {
    id: "content",
    order: 1,
    title: "Content Suggestions",
    badge: "Insight Type 1",
    tone: "content",
    description: "Competitor blog posts and webpages to identify what topics to publish, which narratives to counter, and where IBM can lead the conversation.",
    drives: "Topics to publish, counter-narratives, blog angles",
    overviewHeadline: "Use competitor thought leadership and product messaging to decide what Netezza should publish next.",
    sourceIntro: "Track competitor blogs plus product pages so the team can convert messaging shifts into IBM content opportunities.",
    sources: [
      { id: "content-db-blog", kind: "BLOG", label: "Databricks Blog", competitor: "Databricks", url: "https://www.databricks.com/blog" },
      { id: "content-db-web", kind: "WEB", label: "Databricks Product Page", competitor: "Databricks", url: "https://www.databricks.com/product/data-warehousing" },
      { id: "content-sf-blog", kind: "BLOG", label: "Snowflake Blog", competitor: "Snowflake", url: "https://www.snowflake.com/en/blog/" },
      { id: "content-sf-web", kind: "WEB", label: "Snowflake Product Page", competitor: "Snowflake", url: "https://www.snowflake.com/en/data-cloud/platform/" },
      { id: "content-rs-blog", kind: "BLOG", label: "AWS Big Data Blog (Redshift)", competitor: "Amazon Redshift", url: "https://aws.amazon.com/blogs/big-data/category/database/amazon-redshift/" },
      { id: "content-rs-web", kind: "WEB", label: "Amazon Redshift Product Page", competitor: "Amazon Redshift", url: "https://aws.amazon.com/redshift/" },
      { id: "content-bq-blog", kind: "BLOG", label: "Google Cloud Blog (BigQuery)", competitor: "Google BigQuery", url: "https://cloud.google.com/blog/products/data-analytics" },
      { id: "content-bq-web", kind: "WEB", label: "BigQuery Product Page", competitor: "Google BigQuery", url: "https://cloud.google.com/bigquery" },
      { id: "content-as-blog", kind: "BLOG", label: "Microsoft Azure Synapse Blog", competitor: "Azure Synapse", url: "https://techcommunity.microsoft.com/t5/azure-synapse-analytics-blog/bg-p/AzureSynapseAnalyticsBlog" },
      { id: "content-as-web", kind: "WEB", label: "Azure Synapse Product Page", competitor: "Azure Synapse", url: "https://azure.microsoft.com/en-us/products/synapse-analytics" },
      { id: "content-td-blog", kind: "BLOG", label: "Teradata Blog", competitor: "Teradata", url: "https://www.teradata.com/Blog" },
      { id: "content-td-web", kind: "WEB", label: "Teradata Platform Page", competitor: "Teradata", url: "https://www.teradata.com/platform" },
    ],
    highlights: [
      { competitor: "Databricks", priority: "High priority", title: "Publish a hybrid-first counter to AI platform sprawl", summary: "Databricks keeps bundling AI, lakehouse, and migration value into one platform story. Netezza can counter with a cleaner hybrid and SQL-first decision narrative.", recommendation: "Create one executive POV blog and one seller-facing comparison page that frames architectural simplicity as a business advantage.", tags: ["Hybrid", "Counter-narrative", "Executive blog"] },
      { competitor: "Snowflake", priority: "High priority", title: "Own the TCO predictability angle", summary: "Snowflake still feels easy to buy, but cost predictability remains a recurring tension in competitive messaging and review conversations.", recommendation: "Build a proof-led article and calculator explainer that translates Netezza economics into CFO-friendly language.", tags: ["TCO", "Proof", "Decision support"] },
      { competitor: "Amazon Redshift", priority: "Medium priority", title: "Create a migration comparison page for AWS-native buyers", summary: "Redshift content usually leans technical. That opens space for Netezza to publish a simpler warehouse modernization framework.", recommendation: "Launch a search-friendly comparison page that shows when AWS alignment is not enough for hybrid, governed, or performance-sensitive deployments.", tags: ["Migration", "SEO", "Comparison"] },
      { competitor: "Google BigQuery", priority: "Medium priority", title: "Turn compliance and deployment control into a thought-leadership series", summary: "BigQuery content is strong on AI analytics, but weak on hybrid control and residency-sensitive workloads.", recommendation: "Draft a 3-part series focused on regulated industry analytics, hybrid governance, and why control still matters in 2026.", tags: ["Compliance", "Series", "Regulated industries"] },
    ],
  },
  {
    id: "events",
    order: 2,
    title: "PMM action centre",
    badge: "Insight Type 2",
    tone: "events",
    description: "Turn competitor pressure into the next PMM assets Netezza needs: battle cards, counter-posts, win stories, executive briefings, and analyst-facing materials.",
    drives: "Assets to create, outlines to generate, PMM response plays",
    overviewHeadline: "Use competitor pressure to decide which PMM assets Netezza should create next and make those assets easier to generate.",
    sourceIntro: "These trigger sources combine competitor pages, reviews, and market signals that should create new Netezza PMM assets.",
    sources: [
      { id: "pmm-db-linkedin", kind: "SIGNAL", label: "Databricks LinkedIn Narrative", competitor: "Databricks", url: "https://www.linkedin.com/company/databricks/posts/" },
      { id: "pmm-db-reviews", kind: "REVIEW", label: "Databricks G2 Reviews", competitor: "Databricks", url: "https://www.g2.com/products/databricks-data-intelligence-platform/reviews" },
      { id: "pmm-sf-reviews", kind: "REVIEW", label: "Snowflake G2 Reviews", competitor: "Snowflake", url: "https://www.g2.com/products/snowflake/reviews" },
      { id: "pmm-rs-web", kind: "WEB", label: "Amazon Redshift Features", competitor: "Amazon Redshift", url: "https://aws.amazon.com/redshift/features/" },
      { id: "pmm-bq-blog", kind: "BLOG", label: "BigQuery AI Analytics Blog", competitor: "Google BigQuery", url: "https://cloud.google.com/blog/products/data-analytics" },
      { id: "pmm-as-tr", kind: "REVIEW", label: "Azure Synapse TrustRadius", competitor: "Azure Synapse", url: "https://www.trustradius.com/products/azure-synapse-analytics/reviews" },
      { id: "pmm-td-linkedin", kind: "SIGNAL", label: "Teradata LinkedIn Narrative", competitor: "Teradata", url: "https://www.linkedin.com/company/teradata/posts/" },
      { id: "pmm-netezza-own", kind: "OWN", label: "IBM Netezza Product Page", competitor: "IBM Netezza", url: "https://www.ibm.com/products/netezza" },
    ],
    highlights: [
      { competitor: "Databricks", priority: "Urgent", title: "Create the Netezza vs Databricks battle card and counter-post now", summary: "Databricks is pushing the broadest market narrative against traditional structured analytics. PMM needs ready-to-use assets, not just ideas, to keep field and executive response aligned.", recommendation: "Publish the LinkedIn counter-post first, then equip sellers with the battle card and objection guide for open deals.", tags: ["Battle card", "Counter-post", "Field readiness"] },
      { competitor: "Snowflake", priority: "High priority", title: "Build economics and objection-handling assets for Snowflake-led deals", summary: "Snowflake's ease and momentum still create buyer pull, but cost and workload fit remain rebuttal space for Netezza.", recommendation: "Create a Snowflake battle card plus a CIO-ready economics briefing that simplifies the value case.", tags: ["Economics", "CIO briefing", "Competitive enablement"] },
      { competitor: "Amazon Redshift", priority: "High priority", title: "Equip sellers for AWS-native comparisons", summary: "Redshift can win by default in AWS accounts unless PMM provides sharper workload-fit messaging and seller-ready landmines.", recommendation: "Ship a Redshift battle card and a concise hybrid architecture narrative deck for cloud infrastructure buyers.", tags: ["AWS", "Battle card", "Architecture deck"] },
      { competitor: "Analysts / market", priority: "Medium priority", title: "Prepare analyst and executive proof assets around the category narrative", summary: "The lakehouse-vs-DW storyline is shaping both external perception and internal deal language. PMM should package a consistent executive and analyst response.", recommendation: "Create the analyst briefing memo, CIO briefing, and Q2 asset calendar from one shared narrative framework.", tags: ["Analyst briefing", "Narrative control", "Executive assets"] },
    ],
  },
  {
    id: "market",
    order: 3,
    title: "Market Signals",
    badge: "Insight Type 3",
    tone: "market",
    description: "Track social posts and review sites to surface sentiment shifts, buyer complaints, competitor narrative moves, and emerging deal risks.",
    drives: "Sentiment shifts, buyer complaints, narrative moves",
    overviewHeadline: "Use social and review feeds to capture what buyers are saying and how competitor narratives are moving in-market.",
    sourceIntro: "This page is built for LinkedIn, G2, and TrustRadius sources so PMM can react to buyer language, complaints, and praise quickly.",
    sources: [
      { id: "market-db-social", kind: "SOCIAL", label: "Databricks LinkedIn Posts", competitor: "Databricks", url: "https://www.linkedin.com/company/databricks/posts/" },
      { id: "market-db-g2", kind: "G2", label: "Databricks G2 Reviews", competitor: "Databricks", url: "https://www.g2.com/products/databricks/reviews" },
      { id: "market-db-tr", kind: "TR", label: "Databricks TrustRadius", competitor: "Databricks", url: "https://www.trustradius.com/products/databricks/reviews" },
      { id: "market-sf-social", kind: "SOCIAL", label: "Snowflake LinkedIn Posts", competitor: "Snowflake", url: "https://www.linkedin.com/company/snowflake-computing/posts/" },
      { id: "market-sf-g2", kind: "G2", label: "Snowflake G2 Reviews", competitor: "Snowflake", url: "https://www.g2.com/products/snowflake/reviews" },
      { id: "market-sf-tr", kind: "TR", label: "Snowflake TrustRadius", competitor: "Snowflake", url: "https://www.trustradius.com/products/snowflake/reviews" },
      { id: "market-rs-social", kind: "SOCIAL", label: "Amazon Web Services LinkedIn", competitor: "Amazon Redshift", url: "https://www.linkedin.com/company/amazon-web-services/posts/" },
      { id: "market-rs-g2", kind: "G2", label: "Amazon Redshift G2 Reviews", competitor: "Amazon Redshift", url: "https://www.g2.com/products/amazon-redshift/reviews" },
      { id: "market-rs-tr", kind: "TR", label: "Amazon Redshift TrustRadius", competitor: "Amazon Redshift", url: "https://www.trustradius.com/products/redshift/reviews" },
      { id: "market-bq-social", kind: "SOCIAL", label: "Google Cloud LinkedIn Posts", competitor: "Google BigQuery", url: "https://www.linkedin.com/company/google-cloud/posts/" },
      { id: "market-bq-g2", kind: "G2", label: "BigQuery G2 Reviews", competitor: "Google BigQuery", url: "https://www.g2.com/products/google-bigquery/reviews" },
      { id: "market-bq-tr", kind: "TR", label: "BigQuery TrustRadius", competitor: "Google BigQuery", url: "https://www.trustradius.com/products/google-bigquery/reviews" },
      { id: "market-as-social", kind: "SOCIAL", label: "Microsoft Azure LinkedIn Posts", competitor: "Azure Synapse", url: "https://www.linkedin.com/showcase/microsoft-azure/posts/" },
      { id: "market-as-g2", kind: "G2", label: "Azure Synapse G2 Reviews", competitor: "Azure Synapse", url: "https://www.g2.com/products/microsoft-azure-synapse-analytics/reviews" },
      { id: "market-as-tr", kind: "TR", label: "Azure Synapse TrustRadius", competitor: "Azure Synapse", url: "https://www.trustradius.com/products/azure-synapse-analytics/reviews" },
      { id: "market-td-social", kind: "SOCIAL", label: "Teradata LinkedIn Posts", competitor: "Teradata", url: "https://www.linkedin.com/company/teradata/posts/" },
      { id: "market-td-g2", kind: "G2", label: "Teradata G2 Reviews", competitor: "Teradata", url: "https://www.g2.com/products/teradata-vantage/reviews" },
      { id: "market-td-tr", kind: "TR", label: "Teradata TrustRadius", competitor: "Teradata", url: "https://www.trustradius.com/products/teradata-vantage/reviews" },
    ],
    highlights: [
      { competitor: "Databricks", priority: "High priority", title: "Setup complexity is still a buyer complaint", summary: "Databricks can dominate vision-level messaging while still attracting comments about operational complexity and the burden on analytics teams.", recommendation: "Make SQL-first usability and faster buyer onboarding a stronger proof theme in battlecards, demos, and web copy.", tags: ["Complexity", "Reviews", "Usability"] },
      { competitor: "Snowflake", priority: "High priority", title: "Cost conversations continue to follow positive sentiment", summary: "Snowflake receives praise for user experience and speed, but economics and role complexity still appear in reviews and social chatter.", recommendation: "Pair positive Netezza proof with a simple cost-objection framework so sellers can neutralize the ease-of-use halo.", tags: ["Cost", "Sentiment", "Field play"] },
      { competitor: "Teradata", priority: "Medium priority", title: "Migration effort is a recurring friction point", summary: "Teradata keeps scale credibility, but switching effort and modernization complexity still show up in review language.", recommendation: "Create a migration reassurance kit with time-to-value stories, risk controls, and simplified implementation proof.", tags: ["Migration", "Objection handling", "Proof"] },
      { competitor: "Google BigQuery", priority: "Medium priority", title: "AI-native excitement does not erase hybrid trust gaps", summary: "BigQuery social narratives are strong on AI and developer momentum, but they remain weaker when buyers need deployment control.", recommendation: "Use that gap to drive compliance, residency, and hybrid-trust content across web, sales, and analyst-facing channels.", tags: ["AI", "Hybrid", "Narrative shift"] },
    ],
  },
  {
    id: "product",
    order: 4,
    title: "Product Suggestions",
    badge: "Insight Type 4",
    tone: "product",
    description: "Review competitor capability pages and pricing surfaces to identify feature gaps, packaging opportunities, and what Netezza should build or sharpen to win deals.",
    drives: "Feature gaps in Netezza, what to build to win deals",
    overviewHeadline: "Use competitor capability and pricing pages to turn recurring market pressure into concrete product recommendations.",
    sourceIntro: "These feeds focus on public capability and commercial pages so product and PMM can identify where packaging or roadmap work is needed.",
    sources: [
      { id: "product-db-cap", kind: "CAPABILITY", label: "Databricks Data Warehousing", competitor: "Databricks", url: "https://www.databricks.com/product/data-warehousing" },
      { id: "product-db-price", kind: "PRICE", label: "Databricks Pricing", competitor: "Databricks", url: "https://www.databricks.com/product/pricing" },
      { id: "product-sf-cap", kind: "CAPABILITY", label: "Snowflake Platform", competitor: "Snowflake", url: "https://www.snowflake.com/en/data-cloud/platform/" },
      { id: "product-sf-price", kind: "PRICE", label: "Snowflake Pricing", competitor: "Snowflake", url: "https://www.snowflake.com/en/pricing/" },
      { id: "product-rs-cap", kind: "CAPABILITY", label: "Amazon Redshift Features", competitor: "Amazon Redshift", url: "https://aws.amazon.com/redshift/features/" },
      { id: "product-rs-price", kind: "PRICE", label: "Amazon Redshift Pricing", competitor: "Amazon Redshift", url: "https://aws.amazon.com/redshift/pricing/" },
      { id: "product-bq-cap", kind: "CAPABILITY", label: "BigQuery Product Page", competitor: "Google BigQuery", url: "https://cloud.google.com/bigquery" },
      { id: "product-bq-price", kind: "PRICE", label: "BigQuery Pricing", competitor: "Google BigQuery", url: "https://cloud.google.com/bigquery/pricing" },
      { id: "product-as-cap", kind: "CAPABILITY", label: "Azure Synapse Product Page", competitor: "Azure Synapse", url: "https://azure.microsoft.com/en-us/products/synapse-analytics" },
      { id: "product-as-price", kind: "PRICE", label: "Azure Synapse Pricing", competitor: "Azure Synapse", url: "https://azure.microsoft.com/en-us/pricing/details/synapse-analytics/" },
      { id: "product-td-cap", kind: "CAPABILITY", label: "Teradata Vantage Platform", competitor: "Teradata", url: "https://www.teradata.com/platform" },
      { id: "product-td-price", kind: "PRICE", label: "Teradata Commercial Packaging", competitor: "Teradata", url: "https://www.teradata.com/getting-started" },
    ],
    highlights: [
      { competitor: "Databricks", priority: "High priority", title: "Sharpen the AI ecosystem proof package", summary: "Databricks is still stronger in native AI workflow perception. Even when Netezza can play, the story is not packaged with the same clarity.", recommendation: "Prioritize clearer AI partner proof, reference architectures, and buyer-facing packaging before claiming parity in the field.", tags: ["AI", "Packaging", "Proof"] },
      { competitor: "Snowflake", priority: "High priority", title: "Improve self-service and buyer-facing simplicity proof", summary: "Snowflake remains strong on ease and analyst accessibility. Netezza needs better evidence, not just better messaging.", recommendation: "Invest in onboarding proof, short-path setup stories, and demo flows that show analyst productivity immediately.", tags: ["UX", "Self-service", "Demo"] },
      { competitor: "Google BigQuery", priority: "Medium priority", title: "Bring governed data sharing into the roadmap conversation", summary: "BigQuery and the rest of the cloud set benefit from stronger ecosystem and sharing narratives in modern data estates.", recommendation: "Evaluate packaging or roadmap options that make controlled data collaboration easier to explain and easier to adopt.", tags: ["Ecosystem", "Roadmap", "Governed sharing"] },
      { competitor: "Teradata", priority: "Medium priority", title: "Turn migration accelerators into a more visible product story", summary: "Migration assurance is strategically important, but buyers still struggle to understand how quickly they can transition with low risk.", recommendation: "Package migration accelerators, templates, and services more directly into the product narrative and pricing conversation.", tags: ["Migration", "Acceleration", "Commercial strategy"] },
    ],
  },
  {
    id: "positioning",
    order: 5,
    title: "Positioning",
    badge: "Insight Type 5",
    tone: "positioning",
    description: "Translate product, event, content, and market intelligence into a clear Netezza positioning system across message pillars, response angles, and strength dimensions.",
    drives: "Win themes, response angles, executive narrative",
    overviewHeadline: "Use Netezza strengths and competitor pressure to decide how the product should be framed in-market.",
    sourceIntro: "These sources ground the Netezza baseline so competitor activity can be compared against IBM's own product, review, and thought-leadership footprint.",
    sources: [
      { id: "positioning-product", kind: "OWN", label: "IBM Netezza Product Page", competitor: "IBM Netezza", url: "https://www.ibm.com/products/netezza" },
      { id: "positioning-g2", kind: "OWN", label: "IBM Netezza G2 Reviews", competitor: "IBM Netezza", url: "https://www.g2.com/products/ibm-netezza/reviews" },
      { id: "positioning-tr", kind: "OWN", label: "IBM Netezza TrustRadius", competitor: "IBM Netezza", url: "https://www.trustradius.com/products/ibm-netezza-performance-server/reviews" },
      { id: "positioning-blog", kind: "OWN", label: "IBM Blog / Announcements", competitor: "IBM Netezza", url: "https://www.ibm.com/new/announcements/netezza-in-2026-powering-the-next-era-of-hybrid-analytics" },
      { id: "positioning-linkedin", kind: "OWN", label: "IBM Netezza LinkedIn Page", competitor: "IBM Netezza", url: "https://www.linkedin.com/showcase/ibm-netezza/" },
    ],
    highlights: [
      { competitor: "Across competitors", priority: "Primary angle", title: "Lead with hybrid and regulated-workload confidence", summary: "Netezza's biggest durable differentiation remains deployment flexibility plus IBM trust for highly governed analytics environments.", recommendation: "Keep this as the first message pillar for enterprise accounts that cannot accept cloud-only tradeoffs.", tags: ["Hybrid", "Trust", "Enterprise"] },
      { competitor: "Databricks / BigQuery", priority: "Rebuttal", title: "Counter AI-native narratives with proof, not imitation", summary: "Netezza should not try to sound like a copy of AI-first competitors. It needs credible proof and a sharper role in the enterprise stack.", recommendation: "Use AI ecosystem evidence where real, while keeping the core promise anchored in governed analytics outcomes.", tags: ["AI", "Rebuttal", "Credibility"] },
      { competitor: "Snowflake / Redshift", priority: "Sales angle", title: "Use economics and workload fit to sharpen decisions", summary: "Cost predictability and workload-specific performance remain practical ways to make competitive evaluations clearer for buyers.", recommendation: "Equip sellers with concise proof on performance certainty, economics, and SQL-first simplicity.", tags: ["Economics", "Performance", "Sales play"] },
    ],
  },
];

const MARKET_FILTERS = [
  { id: "all", label: "All sources" },
  { id: "social", label: "Social media" },
  { id: "reviews", label: "G2 / TrustRadius" },
  { id: "blog", label: "Blog / Content" },
  { id: "website", label: "Website changes" },
];

const MARKET_SIGNAL_ITEMS = [
  {
    id: "market-signal-databricks-linkedin",
    competitor: "Databricks",
    group: "social",
    sourceLabel: "LinkedIn",
    sourceBadge: "LINKEDIN",
    sourceUrl: "https://www.linkedin.com/company/databricks",
    actionLabel: "Open LinkedIn",
    freshnessLabel: "31 min ago",
    dateLabel: "Apr 18, 2026",
    isNew: true,
    summary: "Databricks is pushing a warehouse-migration narrative that says value comes from platform consolidation, governed AI, and faster legacy decommissioning. This is a direct modernization story Netezza should answer quickly.",
  },
  {
    id: "market-signal-databricks-website",
    competitor: "Databricks",
    group: "website",
    sourceLabel: "Website",
    sourceBadge: "WEBSITE",
    sourceUrl: "https://docs.databricks.com/aws/en/release-notes/product/2026/april",
    actionLabel: "Open release notes",
    freshnessLabel: "1 day ago",
    dateLabel: "Apr 17, 2026",
    isNew: true,
    summary: "Databricks' April 2026 platform notes add query-based connectors for Teradata, Oracle, SQL Server, MySQL, and more, while also expanding AI governance. The current website story is strengthening migration plus governance at the same time.",
  },
  {
    id: "market-signal-databricks-tr",
    competitor: "Databricks",
    group: "reviews",
    sourceLabel: "TrustRadius",
    sourceBadge: "TRUSTRADIUS",
    sourceUrl: "https://www.trustradius.com/products/databricks-data-intelligence-platform/reviews",
    actionLabel: "View TrustRadius",
    freshnessLabel: "Snapshot",
    dateLabel: "Apr 17, 2026",
    isNew: false,
    summary: "TrustRadius currently shows Databricks at 8.8/10 across 109 ratings. The page reinforces platform breadth and data/AI unification, giving PMM a live benchmark to counter with simpler operational proof.",
  },
  {
    id: "market-signal-snowflake-linkedin",
    competitor: "Snowflake",
    group: "social",
    sourceLabel: "LinkedIn",
    sourceBadge: "LINKEDIN",
    sourceUrl: "https://www.linkedin.com/company/snowflake-computing",
    actionLabel: "Open LinkedIn",
    freshnessLabel: "5 days ago",
    dateLabel: "Apr 13, 2026",
    isNew: true,
    summary: "Snowflake is promoting a migration case study claiming 30% cost savings after moving off physical infrastructure. That message directly targets on-prem and legacy warehouse buyers considering modernization.",
  },
  {
    id: "market-signal-snowflake-g2",
    competitor: "Snowflake",
    group: "reviews",
    sourceLabel: "G2",
    sourceBadge: "G2",
    sourceUrl: "https://www.g2.com/products/snowflake/reviews",
    actionLabel: "View G2",
    freshnessLabel: "3 days ago",
    dateLabel: "Apr 15, 2026",
    isNew: true,
    summary: "A recent G2 review describes Snowflake as reliable and fast for large analytics workloads with straightforward setup, while still noting limited low-level control. Ease plus scale remains Snowflake's strongest review pattern.",
  },
  {
    id: "market-signal-snowflake-website",
    competitor: "Snowflake",
    group: "website",
    sourceLabel: "Website",
    sourceBadge: "WEBSITE",
    sourceUrl: "https://www.snowflake.com/en/migrate-to-the-cloud/",
    actionLabel: "Open page",
    freshnessLabel: "Current page",
    dateLabel: "Apr 18, 2026",
    isNew: false,
    summary: "Snowflake's migration page now leads with free AI-powered migration tools and the Snowpark Migration Accelerator. The website is openly framing migration speed and low-risk modernization as a core demand-gen lever.",
  },
  {
    id: "market-signal-redshift-blog",
    competitor: "Amazon Redshift",
    group: "blog",
    sourceLabel: "Blog",
    sourceBadge: "BLOG",
    sourceUrl: "https://aws.amazon.com/blogs/big-data/amazon-redshift-dc2-migration-approach-with-a-customer-case-study/",
    actionLabel: "Open blog",
    freshnessLabel: "1 month ago",
    dateLabel: "Mar 11, 2026",
    isNew: false,
    summary: "AWS published a fresh Redshift migration case study focused on moving from DC2 to RA3 for better ETL performance, more storage, and cost efficiency. Migration storytelling is still a visible Redshift growth motion.",
  },
  {
    id: "market-signal-bigquery-blog",
    competitor: "Google BigQuery",
    group: "blog",
    sourceLabel: "Blog",
    sourceBadge: "BLOG",
    sourceUrl: "https://cloud.google.com/blog/products/data-analytics/using-the-fully-managed-remote-bigquery-mcp-server-to-build-data-ai-agents",
    actionLabel: "Open blog",
    freshnessLabel: "3 months ago",
    dateLabel: "Jan 7, 2026",
    isNew: false,
    summary: "Google Cloud is using its blog to position BigQuery as the analytics backbone for AI agents through the managed remote MCP server. That keeps BigQuery tightly associated with modern AI-native analytics workflows.",
  },
  {
    id: "market-signal-bigquery-tr",
    competitor: "Google BigQuery",
    group: "reviews",
    sourceLabel: "TrustRadius",
    sourceBadge: "TRUSTRADIUS",
    sourceUrl: "https://www.trustradius.com/products/google-bigquery/reviews",
    actionLabel: "View TrustRadius",
    freshnessLabel: "4 months ago",
    dateLabel: "Jan 2, 2026",
    isNew: false,
    summary: "A recent TrustRadius review positions BigQuery as the central analytical warehouse for large-scale event analytics and product metrics, but still calls out cost optimization and debugging friction. The signal is strong capability with ongoing economics pressure.",
  },
  {
    id: "market-signal-azure-website",
    competitor: "Azure Synapse",
    group: "website",
    sourceLabel: "Website",
    sourceBadge: "WEBSITE",
    sourceUrl: "https://azure.microsoft.com/en-us/products/synapse-analytics/",
    actionLabel: "Open page",
    freshnessLabel: "Current page",
    dateLabel: "Apr 18, 2026",
    isNew: false,
    summary: "Azure Synapse now explicitly pushes 'Migrate to Fabric' on the product page, signaling that Microsoft's current website motion is more about transition and modernization than net-new Synapse differentiation.",
  },
  {
    id: "market-signal-azure-tr",
    competitor: "Azure Synapse",
    group: "reviews",
    sourceLabel: "TrustRadius",
    sourceBadge: "TRUSTRADIUS",
    sourceUrl: "https://www.trustradius.com/products/azure-synapse-analytics/reviews/all",
    actionLabel: "View TrustRadius",
    freshnessLabel: "Review snapshot",
    dateLabel: "Aug 12, 2025",
    isNew: false,
    summary: "Recent TrustRadius commentary says Synapse works well for large data warehouse scenarios but is lagging in active development and trails Databricks in some feature areas. That creates a visible vulnerability in competitive comparisons.",
  },
  {
    id: "market-signal-teradata-linkedin",
    competitor: "Teradata",
    group: "social",
    sourceLabel: "LinkedIn",
    sourceBadge: "LINKEDIN",
    sourceUrl: "https://www.linkedin.com/company/teradata",
    actionLabel: "Open LinkedIn",
    freshnessLabel: "3 hours ago",
    dateLabel: "Apr 18, 2026",
    isNew: true,
    summary: "Teradata's latest LinkedIn update claims its MCP Server is helping a major financial-services customer deliver 50% faster responses, 20%+ higher satisfaction, and roughly 30% lower operational cost. Teradata is leaning hard into governed agentic AI value stories.",
  },
];

const PAGE_CONFIG_BY_ID = Object.fromEntries(INSIGHT_PAGES.map((page) => [page.id, page]));
const COMMUNITY_PAGE_CONFIG_BY_ID = Object.fromEntries(COMMUNITY_PAGES.map((page) => [page.id, page]));
const refs = {
  topbarEyebrow: document.querySelector("#topbarEyebrow"),
  topbarTitle: document.querySelector("#topbarTitle"),
  topbarCopy: document.querySelector("#topbarCopy"),
  lastUpdated: document.querySelector("#lastUpdated"),
  insightTypeCount: document.querySelector("#insightTypeCount"),
  sourceFeedCount: document.querySelector("#sourceFeedCount"),
  sidebarPageNav: document.querySelector("#sidebarPageNav"),
  sidebarContextLabel: document.querySelector("#sidebarContextLabel"),
  sidebarContextList: document.querySelector("#sidebarContextList"),
  sidebarNoteLabel: document.querySelector("#sidebarNoteLabel"),
  sidebarNoteCopy: document.querySelector("#sidebarNoteCopy"),
  sectionTabs: [...document.querySelectorAll("[data-section-target]")],
  sections: {
    overview: document.querySelector("#page-overview"),
    content: document.querySelector("#page-content"),
    events: document.querySelector("#page-events"),
    market: document.querySelector("#page-market"),
    product: document.querySelector("#page-product"),
    positioning: document.querySelector("#page-positioning"),
    manage: document.querySelector("#page-manage"),
    "community-announcements": document.querySelector("#page-community-announcements"),
    "community-thought-leadership": document.querySelector("#page-community-thought-leadership"),
    "community-replies": document.querySelector("#page-community-replies"),
    "community-manage": document.querySelector("#page-community-manage"),
  },
};
const state = hydrateState();
let marketRefreshTimer = null;
let communityRefreshTimer = null;
let marketRequestSequence = 0;

boot();
function boot() {
  renderAllPages();
  renderShell();
  attachEvents();
  setActiveSection(state.activeSection);
  updateHeaderMeta();
  if (window.location.protocol === "file:") {
    renderLocalFileMessage();
    return;
  }
  loadMarketSignals();
  startMarketAutoRefresh();
  startCommunityAutoRefresh();
}

function renderLocalFileMessage() {
  const activeSection = refs.sections[state.activePage] || refs.sections.overview;
  activeSection.innerHTML = `
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Local launch required</p>
          <h3>Open this dashboard through localhost, not by double-clicking index.html</h3>
        </div>
      </div>
      <p class="section-copy">You opened the file directly from Finder using a <code>file://</code> URL. This dashboard needs the local Node server because it fetches live data from <code>/api/workspace-intelligence</code>, which does not exist when the page is opened as a plain file.</p>
      <p class="section-copy">Use <a href="http://localhost:3000">http://localhost:3000</a> after starting the local server with the launcher or by running <code>node server.mjs</code> in Terminal.</p>
    </article>
  `;
  state.marketFeed.loading = false;
  state.marketFeed.error = "Direct file open detected. Start the local server and use http://localhost:3000.";
  state.liveInsights.loading = false;
  state.liveInsights.error = "Local API unavailable in file mode.";
  updateHeaderMeta();
}

function hydrateState() {
  const saved = safeParse(getStorage());
  const activeSection = saved?.activeSection === "community" ? "community" : "pmm";
  const activePageBySection = {
    pmm: PMM_PAGE_IDS.includes(saved?.activePageBySection?.pmm) ? saved.activePageBySection.pmm : "overview",
    community: COMMUNITY_PAGE_IDS.includes(saved?.activePageBySection?.community) ? saved.activePageBySection.community : "community-announcements",
  };
  return {
    activeSection,
    activePage: activePageBySection[activeSection],
    activePageBySection,
    contentIdeaExpandedId: saved?.contentIdeaExpandedId || "",
    pmmActionExpandedId: saved?.pmmActionExpandedId || "",
    marketFeedFilter: saved?.marketFeedFilter || "all",
    marketFeed: {
      loading: true,
      error: "",
      meta: {
        status: "Connecting live sources",
        lastUpdated: "",
        activeSources: 0,
        totalSources: 0,
        failedSources: 0,
      },
      items: clone(MARKET_SIGNAL_ITEMS),
    },
    liveInsights: {
      loading: true,
      error: "",
      meta: {
        mode: "snapshot",
        generatedAt: "",
      },
      sections: null,
    },
    filters: hydrateFilters(saved?.filters),
    sources: hydrateSources(saved?.sources),
    communityKeywords: hydrateCommunityKeywords(saved?.communityKeywords),
    communityPlatforms: hydrateCommunityPlatforms(saved?.communityPlatforms),
    communityMeta: {
      lastUpdated: saved?.communityMeta?.lastUpdated || new Date().toISOString(),
    },
    drafts: {},
  };
}

function hydrateFilters(savedFilters) {
  const filters = {};
  INSIGHT_PAGES.forEach((page) => {
    filters[page.id] = {
      search: savedFilters?.[page.id]?.search || "",
      competitor: savedFilters?.[page.id]?.competitor || "All competitors",
    };
  });
  return filters;
}

function hydrateSources(savedSources) {
  const sources = {};
  INSIGHT_PAGES.forEach((page) => {
    const savedList = Array.isArray(savedSources?.[page.id]) ? savedSources[page.id] : null;
    sources[page.id] = (savedList ? savedList : clone(page.sources)).map(normalizeSource);
  });
  return sources;
}

function hydrateCommunityKeywords(savedKeywords) {
  const list = Array.isArray(savedKeywords) && savedKeywords.length ? savedKeywords : DEFAULT_COMMUNITY_KEYWORDS;
  return list.map((keyword, index) => ({ id: `community-keyword-${index + 1}`, value: String(keyword || "") }));
}

function hydrateCommunityPlatforms(savedPlatforms) {
  const list = Array.isArray(savedPlatforms) && savedPlatforms.length ? savedPlatforms : DEFAULT_COMMUNITY_PLATFORMS;
  return list.map((platform, index) => ({ id: `community-platform-${index + 1}`, value: String(platform || "") }));
}

function normalizeSource(source) {
  return { id: source.id, kind: source.kind, label: source.label, competitor: source.competitor, url: source.url || "" };
}

function renderAllPages() {
  renderOverview();
  INSIGHT_PAGES.forEach((page) => renderPage(page.id));
  renderManagePage();
  COMMUNITY_PAGES.forEach((page) => renderPage(page.id));
}

function renderShell() {
  renderTopbar();
  renderSidebarPages();
  renderSidebarContext();
}

function renderTopbar() {
  const config = SECTION_CONFIG[state.activeSection];
  refs.topbarEyebrow.textContent = config.eyebrow;
  refs.topbarEyebrow.style.display = config.eyebrow ? "" : "none";
  refs.topbarTitle.textContent = config.headerTitle;
  refs.topbarCopy.textContent = config.headerCopy;
  refs.sectionTabs.forEach((button) => button.classList.toggle("active", button.dataset.sectionTarget === state.activeSection));
}

function renderSidebarPages() {
  const pages = getActiveSectionPages();
  refs.sidebarPageNav.innerHTML = pages.map((page) => `
    <button class="nav-button ${page.id === state.activePage ? "active" : ""}" type="button" data-page-target="${page.id}">
      ${escapeHtml(page.title)}
    </button>
  `).join("");
}

function renderSidebarContext() {
  if (state.activeSection === "community") {
    refs.sidebarContextLabel.closest(".sidebar-panel")?.classList.add("is-hidden");
  } else {
    refs.sidebarContextLabel.closest(".sidebar-panel")?.classList.remove("is-hidden");
    refs.sidebarContextLabel.textContent = "Competitors tracked";
    refs.sidebarContextList.innerHTML = [...COMPETITORS].sort((left, right) => right.pressure - left.pressure).map((competitor) => `<div class="sidebar-chip"><div class="chip-left"><span class="competitor-dot" style="background:${escapeAttribute(competitor.color)}"></span><span>${escapeHtml(competitor.name)}</span></div><strong>${competitor.pressure}</strong></div>`).join("");
  }
  refs.sidebarNoteLabel.textContent = SECTION_CONFIG[state.activeSection].noteLabel;
  refs.sidebarNoteCopy.textContent = SECTION_CONFIG[state.activeSection].noteCopy;
}

function getActiveSectionPages() {
  return state.activeSection === "community"
    ? COMMUNITY_PAGES.map((page) => ({ id: page.id, title: page.title }))
    : [
        { id: "overview", title: "Overview" },
        ...INSIGHT_PAGES.map((page) => ({ id: page.id, title: page.title })),
        { id: "manage", title: "Manage" },
      ];
}

function renderOverview() {
  const sourceCount = getTotalSourceCount();
  const primaryThreat = [...COMPETITORS].sort((left, right) => right.pressure - left.pressure)[0];
  const pageSummaries = INSIGHT_PAGES.map((page) => ({
    ...page,
    sourceCount: getSources(page.id).length,
    topInsight: getOverviewInsightForPage(page),
  }));

  refs.sections.overview.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="section-kicker">Overview</p>
        <h2>High-level product marketing insight system</h2>
        <p class="section-copy">A single workspace for comparing IBM Netezza with the competitor set across content, PMM actions, social and review signals, product gaps, and positioning strength.</p>
      </div>
    </div>
    <section class="hero-card">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="section-kicker">Marketing cockpit</p>
          <h2>Turn competitor activity into Netezza-specific moves</h2>
          <p>This workspace follows the source model from your screenshots and organizes the output into five action areas: content suggestions, PMM action centre, market signals, product suggestions, and positioning.</p>
          <div class="hero-tag-row">
            <span class="hero-tag">${COMPETITORS.length} competitors tracked</span>
            <span class="hero-tag">${sourceCount} source feeds in scope</span>
            <span class="hero-tag">Persistent local source editing</span>
            <span class="hero-tag">Overview + dedicated pages</span>
          </div>
          <p class="hero-note">Strongest current positioning angle: lead with hybrid deployment, predictable performance, and regulated-workload confidence against ${escapeHtml(primaryThreat.name)} pressure.</p>
        </div>
        <div class="hero-side">
          <strong>What this overview gives you</strong>
          <p>Product baseline, competitor watchlist, source-to-insight mapping, and real top-line insights from each section with one-click access into the matching page.</p>
        </div>
      </div>
    </section>
    <article class="panel">
      <div class="panel-header"><div><p class="panel-kicker">Overview insights</p><h3>Top insight from each section</h3></div></div>
      <div class="summary-grid">
        ${pageSummaries.map((page) => renderOverviewInsightCard(page)).join("")}
      </div>
    </article>
    <article class="panel overview-chart-panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Competitive sentiment</p>
          <h3>Competitive sentiment - G2 & TrustRadius</h3>
        </div>
        <button class="page-link-button" type="button" data-open-page="market">Full Report</button>
      </div>
      ${renderOverviewSentimentChart()}
    </article>
    <article class="panel overview-chart-panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Competitive positioning radar</p>
          <h3>Competitive positioning radar - Netezza vs all competitors</h3>
        </div>
        <button class="page-link-button" type="button" data-open-page="positioning">Full Report</button>
      </div>
      ${renderOverviewRadarChart()}
    </article>
    <section class="metrics-grid">
      ${renderMetricCard("Competitors tracked", String(COMPETITORS.length), "neutral", "Full warehouse competitor set", "Databricks, Snowflake, Redshift, BigQuery, Azure Synapse, and Teradata.")}
      ${renderMetricCard("Insight types", String(INSIGHT_PAGES.length), "positive", "Overview + 5 pages", "Each insight type has its own page with editable sources and recommended actions.", true)}
      ${renderMetricCard("Source feeds", String(sourceCount), "neutral", "Saved locally in browser", "The source model follows the structure shown in the reference screenshots.")}
      ${renderMetricCard("Top threat", primaryThreat.name, "warn", `${primaryThreat.pressure} pressure`, primaryThreat.narrative)}
    </section>
    <article class="panel">
      <div class="panel-header"><div><p class="panel-kicker">Insight architecture</p><h3>Source feeds and what each insight type drives</h3></div></div>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Insight Type</th><th>Colour</th><th>Sources</th><th>What it drives</th></tr></thead>
          <tbody>
            ${INSIGHT_PAGES.map((page) => `<tr><td><strong>${page.order}. ${escapeHtml(page.title)}</strong></td><td>${escapeHtml(getToneLabel(page.tone))}</td><td>${escapeHtml(page.sourceIntro)}</td><td>${escapeHtml(page.drives)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderOverviewInsightCard(page) {
  const insight = page.topInsight;

  return `
    <article class="summary-card overview-insight-card">
      <div class="summary-top">
        <div>
          <span class="tone-pill tone-${page.tone}">${escapeHtml(page.badge)}</span>
          <h3>${escapeHtml(page.title)}</h3>
        </div>
        <span class="mini-pill">${page.sourceCount} sources</span>
      </div>
      <p class="summary-copy"><strong>Current insight:</strong> ${escapeHtml(insight.title)}</p>
      <p class="summary-copy">${escapeHtml(insight.summary)}</p>
      <div class="overview-insight-meta">
        <span class="tag tone-${page.tone}">${escapeHtml(page.drives)}</span>
        <span class="tag">${escapeHtml(insight.competitor)}</span>
        <span class="tag">${escapeHtml(insight.priority)}</span>
      </div>
      <p class="summary-copy"><strong>Recommended next move:</strong> ${escapeHtml(insight.recommendation)}</p>
      <div class="overview-insight-footer">
        <span class="overview-insight-linkcopy">Opens the ${escapeHtml(page.title)} page</span>
        <button class="page-link-button" type="button" data-open-page="${page.id}">Go To ${escapeHtml(page.title)}</button>
      </div>
    </article>
  `;
}

function getLiveSectionData(sectionId) {
  return state.liveInsights?.sections?.[sectionId] || null;
}

function getOverviewInsightForPage(page) {
  const liveOverview = getLiveSectionData("overview")?.pageInsights?.[page.id];
  if (liveOverview) {
    return liveOverview;
  }

  if (page.id === "content") {
    const section = getLiveSectionData("content");
    if (section?.ideas?.length) {
      return {
        competitor: section.ideas[0].tags?.find((tag) => tag.startsWith("Counter-"))?.replace("Counter-", "") || "Live",
        priority: section.ideas[0].status || "Live",
        title: section.ideas[0].title,
        summary: section.ideas[0].summary,
        recommendation: `Draft on ${section.ideas[0].platform} from the Content Suggestions page.`,
      };
    }
  }

  if (page.id === "events") {
    const section = getLiveSectionData("events");
    if (section?.actions?.length) {
      return {
        competitor: section.actions[0].title.replace("Battle card: Netezza vs ", "").replace("Counter-post: ", ""),
        priority: section.actions[0].status || "Live",
        title: section.actions[0].title,
        summary: section.actions[0].summary,
        recommendation: "Open PMM action centre and expand the ready-to-use outline.",
      };
    }
  }

  if (page.id === "product") {
    const section = getLiveSectionData("product");
    if (section?.remainingGaps?.length) {
      return {
        competitor: section.remainingGaps[0].competitors?.[0] || "Live",
        priority: section.remainingGaps[0].priority,
        title: section.remainingGaps[0].title,
        summary: section.remainingGaps[0].copy,
        recommendation: section.remainingGaps[0].leverage,
      };
    }
  }

  if (page.id === "positioning") {
    const section = getLiveSectionData("positioning");
    if (section?.responseAngles?.length) {
      return section.responseAngles[0];
    }
  }

  return page.highlights[0];
}

function renderPage(pageId) {
  const page = PAGE_CONFIG_BY_ID[pageId] || COMMUNITY_PAGE_CONFIG_BY_ID[pageId];
  if (pageId === "manage") {
    renderManagePage();
    return;
  }
  if (!page) return;
  if (COMMUNITY_PAGE_CONFIG_BY_ID[pageId]) {
    refs.sections[pageId].innerHTML = renderCommunityPage(page);
    return;
  }
  refs.sections[pageId].innerHTML = pageId === "positioning"
    ? renderPositioningPage(page)
    : pageId === "product"
      ? renderProductPage(page)
    : pageId === "events"
      ? renderPmmActionPage(page)
    : pageId === "content"
      ? renderContentPage(page)
    : pageId === "market"
      ? renderMarketPage(page)
      : renderGenericPage(page);
}

function renderManagePage() {
  refs.sections.manage.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="section-kicker">Workspace controls</p>
        <h2>Manage</h2>
        <p class="section-copy">Maintain the core product profile, tracked competitors, and all monitoring sources from one place.</p>
      </div>
    </div>
    <div class="layout-grid">
      <article class="panel">
        <div class="product-header">
          <div>
            <p class="panel-kicker">My product</p>
            <h3>${escapeHtml(PRODUCT_PROFILE.name)}</h3>
            <p class="panel-subcopy">${escapeHtml(PRODUCT_PROFILE.subtitle)}</p>
          </div>
          <div class="product-meta">Last updated: ${formatDate(new Date())}</div>
        </div>
        <div class="field-grid">
          ${PRODUCT_PROFILE.fields.map((field) => `<article class="field-card"><p class="field-label">${escapeHtml(field.label)}</p><div class="field-value">${escapeHtml(field.value)}</div></article>`).join("")}
        </div>
        <div class="callout-note"><strong>How this is used:</strong> ${escapeHtml(PRODUCT_PROFILE.usageNote)}</div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><p class="panel-kicker">Competitors tracked</p><h3>Competitive set in scope</h3></div></div>
        <div class="competitor-list">
          ${COMPETITORS.map((competitor) => `<article class="competitor-item"><div class="competitor-meta"><span class="competitor-dot" style="background:${escapeAttribute(competitor.color)}"></span><div><strong>${escapeHtml(competitor.name)}</strong><span>${escapeHtml(competitor.narrative)}</span></div></div><div class="score-chip">${competitor.pressure}</div></article>`).join("")}
        </div>
      </article>
    </div>
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Sources</p>
          <h3>Source management</h3>
          <p class="panel-subcopy">Edit all source URLs here instead of inside the individual insight pages.</p>
        </div>
      </div>
      <div class="manage-source-stack">
        ${INSIGHT_PAGES.map((page) => renderManageSourceGroup(page)).join("")}
      </div>
    </article>
  `;
}

function renderCommunityPage(page) {
  return page.id === "community-manage"
    ? renderCommunityManagePage(page)
    : renderCommunitySignalsPage(page);
}

function renderPmmActionPage(page) {
  const expandedActionId = state.pmmActionExpandedId || "";
  const section = getLiveSectionData("events");
  const alert = section?.alert || PMM_ACTION_ALERT;
  const actions = section?.actions?.length ? section.actions : PMM_ACTIONS;
  return `
    <div class="section-heading">
      <div>
        <p class="section-kicker">${escapeHtml(page.badge)}</p>
        <h2>PMM action centre</h2>
        <p class="section-copy">Click any action to expand a ready-to-use outline, then generate the full asset with AI.</p>
      </div>
    </div>
    <article class="pmm-alert-banner">
      <div class="pmm-alert-icon">!</div>
      <div>
        <strong>${escapeHtml(alert.title)}</strong>
        <p>${escapeHtml(alert.copy)}</p>
      </div>
    </article>
    <article class="panel pmm-actions-panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Generate assets with AI - click any to expand outline</p>
          <h3>Recommended PMM assets for Netezza</h3>
          <p class="panel-subcopy">Each action is mapped to competitor pressure and includes a ready-to-use asset outline.</p>
        </div>
      </div>
      <div class="pmm-action-list">
        ${actions.map((action) => renderPmmActionItem(action, expandedActionId)).join("")}
      </div>
    </article>
  `;
}

function renderProductPage(page) {
  const allSources = getSources(page.id);
  const section = getLiveSectionData("product");
  const confirmedCapabilities = section?.confirmedCapabilities?.length ? section.confirmedCapabilities : PRODUCT_CONFIRMED_CAPABILITIES;
  const criticalGap = section?.criticalGap || PRODUCT_CRITICAL_GAP;
  const confirmedStrengths = section?.confirmedStrengths?.length ? section.confirmedStrengths : PRODUCT_CONFIRMED_STRENGTHS;
  const remainingGaps = section?.remainingGaps?.length ? section.remainingGaps : PRODUCT_REMAINING_GAPS;
  return `
    <div class="section-heading">
      <div>
        <p class="section-kicker">${escapeHtml(page.badge)}</p>
        <h2>Product capability suggestions</h2>
        <p class="section-copy">Netezza current capabilities vs competitor capabilities, updated from IBM announcements and public competitor product pages.</p>
      </div>
    </div>
    <article class="product-capability-banner product-capability-banner-positive">
      <div class="product-capability-banner-head">
        <strong>Confirmed new capabilities - now usable in PMM messaging</strong>
      </div>
      <div class="product-capability-pill-row">
        ${confirmedCapabilities.map((item) => `<span class="product-capability-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
      <p class="product-capability-banner-copy">Sources: NCOS announcement, Jan-Feb 2026 IBM updates, AI Database Assistant packaging, Iceberg ecosystem messaging, and regulated-readiness proof.</p>
    </article>
    <article class="product-capability-banner product-capability-banner-critical">
      <div class="product-capability-banner-head">
        <strong>${escapeHtml(criticalGap.title)}</strong>
      </div>
      <p class="product-capability-banner-copy">${escapeHtml(criticalGap.copy)}</p>
    </article>
    <article class="panel product-matrix-panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Capability matrix - Netezza vs all 6 competitors</p>
          <h3>Capability matrix - Netezza vs all 6 competitors</h3>
        </div>
        <div class="product-legend">
          <span class="product-legend-item"><span class="product-status-icon strong">✓</span> Strong</span>
          <span class="product-legend-item"><span class="product-status-icon partial">◆</span> Partial</span>
          <span class="product-legend-item"><span class="product-status-icon gap">×</span> Gap</span>
        </div>
      </div>
      <div class="table-wrap">
        <table class="product-matrix-table">
          <thead>
            <tr>
              <th>Capability</th>
              ${["Netezza", "Databricks", "Snowflake", "Amazon Redshift", "Google BigQuery", "Azure Synapse", "Teradata"].map((name) => `<th class="${name === "Netezza" ? "is-netezza" : ""}">${escapeHtml(shortCompetitorLabel(name))}</th>`).join("")}
              <th>Gap score</th>
            </tr>
          </thead>
          <tbody>
            ${PRODUCT_CAPABILITY_MATRIX.map((row) => renderProductMatrixRow(row)).join("")}
          </tbody>
        </table>
      </div>
    </article>
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Confirmed strengths</p>
          <h3>Confirmed strengths - now use these in PMM messaging</h3>
          <p class="panel-subcopy">Capabilities Netezza can confidently message today because the product proof is now public and usable.</p>
        </div>
      </div>
      <div class="product-strength-list">
        ${confirmedStrengths.map((item) => renderProductStrengthCard(item)).join("")}
      </div>
    </article>
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Remaining gaps</p>
          <h3>Remaining gaps - product investment needed</h3>
          <p class="panel-subcopy">These are the missing or partial capabilities competitors are using most aggressively against Netezza today.</p>
        </div>
      </div>
      <div class="product-gap-list">
        ${remainingGaps.map((item) => renderProductGapCard(item)).join("")}
      </div>
    </article>
    <section class="metrics-grid">
      ${renderMetricCard("Reference sources", String(allSources.length), "neutral", "All configured in Manage", "Capability and pricing pages used to track public product moves.", true)}
      ${renderMetricCard("Matrix rows", String(PRODUCT_CAPABILITY_MATRIX.length), "positive", "Across all 6 competitors", "Core capability view for PMM and product strategy.")}
      ${renderMetricCard("Confirmed strengths", String(confirmedStrengths.length), "neutral", "Ready for PMM use", "Capabilities that can move from roadmap talk to active messaging.")}
      ${renderMetricCard("Investment gaps", String(remainingGaps.length), "warn", "Prioritized by market pressure", "Where roadmap, packaging, or ecosystem work is still needed.")}
    </section>
  `;
}

function renderContentPage(page) {
  const expandedIdeaId = state.contentIdeaExpandedId || "";
  const section = getLiveSectionData("content");
  const alert = section?.alert || CONTENT_IDEA_ALERT;
  const ideas = section?.ideas?.length ? section.ideas : CONTENT_IDEAS;
  return `
    <div class="section-heading">
      <div>
        <p class="section-kicker">${escapeHtml(page.badge)}</p>
        <h2>Thought leadership content ideas</h2>
        <p class="section-copy">Q2 2026 - mapped to competitor gaps and review themes</p>
      </div>
    </div>
    <article class="content-alert-banner">
      <div class="content-alert-icon">!</div>
      <div>
        <strong>${escapeHtml(alert.title)}</strong>
        <p>${escapeHtml(alert.copy)}</p>
      </div>
    </article>
    <article class="panel content-ideas-panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Recommended Content - Q2 2026</p>
          <h3>Thought leadership content mapped to competitor gaps</h3>
          <p class="panel-subcopy">Each recommendation includes the best publishing platform and a ready-to-use draft outline.</p>
        </div>
      </div>
      <div class="content-idea-list">
        ${ideas.map((idea) => renderContentIdeaItem(idea, expandedIdeaId)).join("")}
      </div>
    </article>
  `;
}

function renderMarketPage(page) {
  const activeFilter = state.marketFeedFilter || "all";
  const feedItems = state.marketFeed.items?.length ? state.marketFeed.items : MARKET_SIGNAL_ITEMS;
  const signals = feedItems.filter((item) => activeFilter === "all" || item.group === activeFilter);
  const status = getMarketFeedStatus();

  return `
    <div class="section-heading">
      <div>
        <p class="section-kicker">${escapeHtml(page.badge)}</p>
        <h2>${escapeHtml(page.title)}</h2>
        <p class="section-copy">${escapeHtml(page.description)}</p>
      </div>
    </div>
    <article class="section-banner">
      <div>
        <span class="tone-pill tone-${page.tone}">${escapeHtml(page.badge)}</span>
        <p class="section-copy">Auto-refreshing competitor signal feed across official webpages, social media, G2, TrustRadius, and blog sources. Every item below links back to its exact reference page so PMM can inspect and counter quickly.</p>
      </div>
      <div class="banner-driver">
        <strong>Live response board</strong>
        <p class="section-copy">The feed refreshes automatically every ${Math.round(MARKET_REFRESH_INTERVAL_MS / 1000)} seconds and falls back to aggressive seeded signals if a source cannot be reached.</p>
      </div>
    </article>
    <article class="panel market-feed-panel">
      <div class="market-filter-row">
        ${MARKET_FILTERS.map((filter) => `
          <button class="market-filter-button ${activeFilter === filter.id ? "active" : ""}" type="button" data-market-filter="${filter.id}">
            ${escapeHtml(filter.label)}
          </button>
        `).join("")}
      </div>
      <div class="market-feed-status">
        <div class="market-feed-status-copy">
          <strong>${escapeHtml(status.label)}</strong>
          <span>${escapeHtml(status.detail)}</span>
          ${status.error ? `<span class="market-feed-warning">${escapeHtml(status.error)}</span>` : ""}
        </div>
        <div class="market-feed-status-meta">
          <span>${escapeHtml(status.updated)}</span>
          <button class="secondary-button" type="button" data-market-refresh>Refresh now</button>
        </div>
      </div>
      <div class="market-feed-list">
        ${signals.length ? signals.map((item) => renderMarketSignalItem(item)).join("") : `<div class="empty-state">No market signals match this filter right now.</div>`}
      </div>
    </article>
  `;
}

function renderMarketSignalItem(item) {
  return `
    <article class="market-signal-item">
      <div class="market-signal-main">
        <div class="market-signal-topline">
          <span class="market-signal-dot"></span>
          <span class="market-signal-source">
            ${escapeHtml(item.competitor.toUpperCase())} •
            <a class="market-source-link" href="${escapeAttribute(item.sourceUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.sourceLabel.toUpperCase())}</a>
          </span>
          ${item.isNew ? `<span class="market-new-badge">NEW</span>` : ""}
        </div>
        ${item.headline ? `<p class="market-signal-headline">${escapeHtml(item.headline)}</p>` : ""}
        <p class="market-signal-copy">${escapeHtml(item.summary)}</p>
        <div class="market-signal-meta">
          <span>${escapeHtml(item.freshnessLabel)}</span>
          <span>•</span>
          <span>${escapeHtml(item.dateLabel)}</span>
          <span class="tag tone-market">${escapeHtml(item.sourceBadge)}</span>
        </div>
      </div>
      <div class="market-signal-actions">
        <a class="market-action-link" href="${escapeAttribute(item.sourceUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.actionLabel)}</a>
      </div>
    </article>
  `;
}

function renderGenericPage(page) {
  const allSources = getSources(page.id);
  const filteredSources = getFilteredSources(page.id);
  const coveredCompetitors = getCoveredCompetitors(page.id);
  return `
    <div class="section-heading"><div><p class="section-kicker">${escapeHtml(page.badge)}</p><h2>${escapeHtml(page.title)}</h2><p class="section-copy">${escapeHtml(page.description)}</p></div></div>
    <article class="section-banner"><div><span class="tone-pill tone-${page.tone}">${escapeHtml(page.badge)}</span><p class="section-copy">${escapeHtml(page.sourceIntro)}</p></div><div class="banner-driver"><strong>What it drives</strong><p class="section-copy">${escapeHtml(page.drives)}</p></div></article>
    <section class="metrics-grid">
      ${renderMetricCard("Source feeds", String(allSources.length), "neutral", `${filteredSources.length} in current view`, "Editable source rows that can be saved locally for this insight type.", true)}
      ${renderMetricCard("Competitors covered", String(coveredCompetitors.length), "neutral", coveredCompetitors.slice(0, 3).join(", ") || "No competitors", "Competitor coverage based on the configured source list.")}
      ${renderMetricCard("Recommendations", String(page.highlights.length), "positive", page.highlights[0].priority, "Seeded insight cards that show what this page should surface for PMM.")}
      ${renderMetricCard("Primary driver", page.drives, "warn", "Ready for overview roll-up", "The summary that appears in the overview page for this insight type.")}
    </section>
    <article class="panel"><div class="panel-header"><div><p class="panel-kicker">Source feed</p><h3>Configured monitoring sources</h3><p class="panel-subcopy">Filter by competitor, search by source name, edit URLs inline, and save your changes locally.</p></div></div>${renderSourcePanel(page, filteredSources)}</article>
    <article class="panel"><div class="panel-header"><div><p class="panel-kicker">Insights</p><h3>${escapeHtml(page.title)} recommendations</h3></div></div><div class="insight-grid">${page.highlights.map((highlight) => renderHighlightCard(highlight, page.tone)).join("")}</div></article>
  `;
}

function renderPositioningPage(page) {
  const strongestDimension = [...POSITIONING_DIMENSIONS].sort((left, right) => right.netezza - left.netezza)[0];
  const section = getLiveSectionData("positioning");
  const recommendation = section?.recommendation || POSITIONING_RECOMMENDATION;
  const pillars = section?.messagePillars?.length ? section.messagePillars : MESSAGE_PILLARS;
  const responseAngles = section?.responseAngles?.length ? section.responseAngles : page.highlights;
  return `
    <div class="section-heading"><div><p class="section-kicker">${escapeHtml(page.badge)}</p><h2>${escapeHtml(page.title)}</h2><p class="section-copy">${escapeHtml(page.description)}</p></div></div>
    <article class="section-banner"><div><span class="tone-pill tone-${page.tone}">${escapeHtml(page.badge)}</span><p class="section-copy">${escapeHtml(page.overviewHeadline)}</p></div><div class="banner-driver"><strong>Strongest position today</strong><p class="section-copy">${escapeHtml(strongestDimension.label)} (${strongestDimension.netezza.toFixed(1)})</p></div></article>
    <article class="positioning-recommendation-card">
      <div class="positioning-recommendation-icon">!</div>
      <div class="positioning-recommendation-copy">
        <p class="positioning-recommendation-label">${escapeHtml(recommendation.label)}</p>
        <p class="positioning-recommendation-text">Netezza's clearest differentiated position: <strong>"${escapeHtml(recommendation.statement)}"</strong> ${escapeHtml(recommendation.evidence)}</p>
      </div>
    </article>
    <div class="positioning-grid">
      <article class="panel"><div class="panel-header"><div><p class="panel-kicker">Strength grid</p><h3>Positioning strength vs all 6 competitors</h3><p class="panel-subcopy">Scores out of 10 based on public reviews, analyst framing, website narratives, and IBM product analysis.</p></div></div><div class="dimension-stack">${POSITIONING_DIMENSIONS.map((dimension) => renderDimensionCard(dimension)).join("")}</div></article>
      <article class="panel"><div class="panel-header"><div><p class="panel-kicker">${pillars.length} messaging pillars</p><h3>Core IBM-aligned talk track</h3></div></div><div class="pillar-grid">${pillars.map((pillar, index) => renderPillarCard(pillar, index)).join("")}</div></article>
    </div>
    <article class="panel"><div class="panel-header"><div><p class="panel-kicker">Response angles</p><h3>Counter-positioning framework</h3><p class="panel-subcopy">Field-ready rebuttals that translate competitor pressure into a sharper Netezza narrative.</p></div></div><div class="angle-grid positioning-angle-grid">${responseAngles.map((highlight, index) => renderPositioningAngleCard(highlight, page.tone, index)).join("")}</div></article>
    <section class="metrics-grid">
      ${renderMetricCard("Reference sources", String(getSources(page.id).length), "neutral", "Managed in one place", "IBM-owned product, review, and announcement sources used as the Netezza baseline.", true)}
      ${renderMetricCard("Positioning dimensions", String(POSITIONING_DIMENSIONS.length), "positive", "Scored vs all 6 competitors", "Core dimensions used to explain where Netezza leads and where the story needs work.")}
      ${renderMetricCard("Message pillars", String(pillars.length), "neutral", "Reusable talk tracks", "Use these pillars across overview, web copy, seller briefs, and event messaging.")}
      ${renderMetricCard("Response angles", String(responseAngles.length), "warn", "Prioritized rebuttal system", "Concise ways to translate competitive pressure into field-ready messaging.")}
    </section>
    <article class="panel"><div class="product-header"><div><p class="panel-kicker">My product</p><h3>${escapeHtml(PRODUCT_PROFILE.name)}</h3><p class="panel-subcopy">${escapeHtml(PRODUCT_PROFILE.subtitle)}</p></div><div class="product-meta">Last updated: ${formatDate(new Date())}</div></div><div class="field-grid">${PRODUCT_PROFILE.fields.map((field) => `<article class="field-card"><p class="field-label">${escapeHtml(field.label)}</p><div class="field-value">${escapeHtml(field.value)}</div></article>`).join("")}</div><div class="callout-note"><strong>How this is used:</strong> ${escapeHtml(PRODUCT_PROFILE.usageNote)}</div></article>
  `;
}

function renderContentIdeaItem(idea, expandedIdeaId) {
  const expanded = idea.id === expandedIdeaId;
  const hasStatus = Boolean(idea.status);
  return `
    <article class="content-idea-item ${expanded ? "expanded" : ""}">
      <div class="content-idea-row">
        <div class="content-idea-main">
          <div class="content-idea-icon">${escapeHtml(idea.icon)}</div>
          <div class="content-idea-copy">
            <div class="content-idea-title-row">
              <h3>${escapeHtml(idea.title)}</h3>
              ${hasStatus ? `<span class="content-status-pill">${escapeHtml(idea.status)}</span>` : ""}
            </div>
            <p class="content-idea-summary">${escapeHtml(idea.summary)}</p>
            <div class="content-idea-tags">
              <span class="content-platform-pill">${escapeHtml(idea.platform)}</span>
              ${idea.tags.map((tag) => `<span class="content-tag">${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
        </div>
        <button class="content-outline-button" type="button" data-content-outline="${idea.id}">
          ${expanded ? "Close" : "Draft"} ${escapeHtml(idea.platform)}
        </button>
      </div>
      ${expanded ? `<div class="content-outline-panel"><pre>${escapeHtml(idea.outline)}</pre></div>` : ""}
    </article>
  `;
}

function renderPmmActionItem(action, expandedActionId) {
  const expanded = action.id === expandedActionId;
  const hasStatus = Boolean(action.status);
  return `
    <article class="pmm-action-item ${expanded ? "expanded" : ""}">
      <div class="pmm-action-row">
        <div class="pmm-action-main">
          <div class="pmm-action-icon">${escapeHtml(action.icon)}</div>
          <div class="pmm-action-copy">
            <div class="pmm-action-title-row">
              <h3>${escapeHtml(action.title)}</h3>
              ${hasStatus ? `<span class="pmm-status-pill">${escapeHtml(action.status)}</span>` : ""}
            </div>
            <p class="pmm-action-summary">${escapeHtml(action.summary)}</p>
          </div>
        </div>
        <button class="pmm-action-button" type="button" data-pmm-action="${action.id}">
          ${expanded ? "Close" : "Outline"}
        </button>
      </div>
      ${expanded ? `<div class="pmm-outline-panel"><pre>${escapeHtml(action.outline)}</pre></div>` : ""}
    </article>
  `;
}

function renderProductMatrixRow(row) {
  const competitors = ["Netezza", "Databricks", "Snowflake", "Amazon Redshift", "Google BigQuery", "Azure Synapse", "Teradata"];
  return `
    <tr>
      <td class="product-capability-cell">
        <strong>${escapeHtml(row.capability)}</strong>
        <span>${escapeHtml(row.note)}</span>
      </td>
      ${competitors.map((name) => `<td class="product-status-cell ${name === "Netezza" ? "is-netezza" : ""}">${renderProductStatus(row.statuses[name])}</td>`).join("")}
      <td class="product-gap-score-cell">${renderProductGapScore(row.gapScore)}</td>
    </tr>
  `;
}

function renderProductStrengthCard(item) {
  return `
    <article class="product-strength-card">
      <div class="product-strength-top">
        <span class="product-strength-status">${escapeHtml(item.status)}</span>
        <h3>${escapeHtml(item.title)}</h3>
      </div>
      <p class="product-strength-copy">${escapeHtml(item.summary)}</p>
      <div class="product-strength-meta">
        <div>
          <span class="product-mini-label">Use this now</span>
          <p>${escapeHtml(item.leverage)}</p>
        </div>
      </div>
      <div class="tag-row">
        ${item.tags.map((tag) => `<span class="tag tone-product">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderProductGapCard(item) {
  return `
    <article class="product-gap-card">
      <div class="product-gap-top">
        <div class="product-gap-heading">
          <span class="product-gap-priority">${escapeHtml(item.priority)}</span>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
        <div class="product-gap-score-label">Gap score: ${escapeHtml(item.gapScore)}</div>
      </div>
      <p class="product-gap-copy">${escapeHtml(item.copy)}</p>
      <div class="product-gap-meta-grid">
        <div>
          <span class="product-mini-label">What Netezza has now</span>
          <p>${escapeHtml(item.current)}</p>
        </div>
        <div>
          <span class="product-mini-label">IBM asset to leverage</span>
          <p>${escapeHtml(item.leverage)}</p>
        </div>
        <div>
          <span class="product-mini-label">Buyer impact</span>
          <p>${escapeHtml(item.impact)}</p>
        </div>
      </div>
      <div class="product-gap-competitors">
        <span class="product-mini-label">Competitors with this capability</span>
        <div class="tag-row">
          ${item.competitors.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderManageSourceGroup(page) {
  return `
    <section class="manage-source-group">
      <div class="manage-source-group-head">
        <div>
          <p class="panel-kicker">${escapeHtml(page.badge)}</p>
          <h3>${escapeHtml(page.title)}</h3>
          <p class="panel-subcopy">${escapeHtml(page.sourceIntro)}</p>
        </div>
      </div>
      ${renderSourcePanel(page, getFilteredSources(page.id))}
    </section>
  `;
}

function renderCommunitySignalsPage(page) {
  const bucketByPage = {
    "community-announcements": {
      id: "announcements",
      title: "Best for announcements",
      description: "Use these communities when IBM Netezza has launches, release notes, product updates, or announcement moments that can ride existing attention.",
      label: "Best for release drops",
    },
    "community-thought-leadership": {
      id: "thought-leadership",
      title: "Best for thought leadership",
      description: "Use these when you want to share a stronger category point of view, architecture guidance, or narrative framing rather than a direct product post.",
      label: "Best for architecture POVs",
    },
    "community-replies": {
      id: "replies",
      title: "Best for direct engagement replies",
      description: "Use these when the conversation is already active and the best move is a contextual response, proof point, or thread-native follow-up.",
      label: "Best for reply-based engagement",
    },
  };
  const bucket = bucketByPage[page.id];
  const groups = COMMUNITY_SIGNAL_GROUPS.filter((group) => group.play === bucket.id);
  const discussionCount = groups.reduce((sum, group) => sum + group.discussions.length, 0);
  const bucketMetrics = bucket.id === "announcements"
    ? [
        ["Communities found", String(groups.length), "neutral", "Release-aware shortlist", "Communities most suitable for launch notes, release posts, and announcement visibility."],
        ["Active discussion pages", String(discussionCount), "positive", "Announcement-friendly threads", "Existing discussion pages where a Netezza release can join the conversation at the right moment."],
        ["Target platforms", String(state.communityPlatforms.length), "warn", "Editable in Manage", "Platforms currently in scope for launch and release sharing."],
        ["Best move", "Release drop", "neutral", "Right-time distribution", "Use these spaces when IBM Netezza has a product update, release note, or formal announcement."],
      ]
    : bucket.id === "thought-leadership"
      ? [
          ["Communities found", String(groups.length), "neutral", "POV-ready shortlist", "Communities where architecture framing and category narrative posts can travel well."],
          ["Active discussion pages", String(discussionCount), "positive", "Debate-heavy threads", "Discussion pages where warehouse, lakehouse, and modernization narratives are actively being shaped."],
          ["Focus themes", String(state.communityKeywords.length), "neutral", "Editable in Manage", "Keyword themes that drive which category debates stay in scope."],
          ["Best move", "Architecture POV", "warn", "Narrative shaping", "Use these spaces for IBM Netezza thought leadership rather than direct launch promotion."],
        ]
      : [
          ["Communities found", String(groups.length), "neutral", "Reply-ready shortlist", "Communities where the best move is a contextual reply inside an existing thread."],
          ["Active discussion pages", String(discussionCount), "positive", "Conversation entry points", "Discussion pages where the team can respond with proof, guidance, or a thread-native follow-up."],
          ["Focus themes", String(state.communityKeywords.length), "neutral", "Editable in Manage", "Keyword themes currently shaping which conversations get prioritized."],
          ["Best move", "Direct reply", "warn", "Thread-native engagement", "Use these spaces when the strongest action is a contextual response instead of a standalone post."],
        ];
  return `
    <div class="section-heading">
      <div>
        <p class="section-kicker">${escapeHtml(page.badge)}</p>
        <h2>${escapeHtml(page.title)}</h2>
        <p class="section-copy">${escapeHtml(page.description)}</p>
      </div>
      <button class="secondary-button" type="button" data-community-refresh>Refresh now</button>
    </div>
    <section class="metrics-grid">
      ${bucketMetrics.map((metric, index) => renderMetricCard(metric[0], metric[1], metric[2], metric[3], metric[4], index === 0)).join("")}
    </section>
    <div class="community-stack">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Engagement bucket</p>
            <h3>${escapeHtml(bucket.title)}</h3>
            <p class="panel-subcopy">${escapeHtml(bucket.description)}</p>
          </div>
          <span class="mini-pill">${groups.length} platform ${groups.length === 1 ? "group" : "groups"}</span>
        </div>
        <div class="community-stack">
          ${groups.map((group) => `
            <article class="summary-card community-group-card">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">${escapeHtml(group.community)}</p>
                  <h3>${escapeHtml(group.group)}</h3>
                  <p class="panel-subcopy">${escapeHtml(group.audience)}</p>
                </div>
                <div class="tag-row">
                  <span class="tag tone-${page.tone}">${escapeHtml(bucket.label)}</span>
                  <span class="mini-pill">${group.discussions.length} discussion ${group.discussions.length === 1 ? "page" : "pages"}</span>
                </div>
              </div>
              <p class="summary-copy"><strong>Why this is relevant:</strong> ${escapeHtml(group.fit)}</p>
              <div class="community-signal-list">
                ${group.discussions.map((discussion) => `
                  <article class="summary-card community-signal-card">
                    <div class="summary-top">
                      <div>
                        <span class="tone-pill tone-${page.tone}">${escapeHtml(bucket.label)}</span>
                        <h3>${escapeHtml(discussion.title)}</h3>
                      </div>
                    </div>
                    <p class="summary-copy"><strong>What is being discussed:</strong> ${escapeHtml(discussion.signal)}</p>
                    <p class="summary-copy"><strong>Why Netezza should care:</strong> ${escapeHtml(discussion.content)}</p>
                    <p class="summary-copy"><a href="${escapeAttribute(discussion.url)}" target="_blank" rel="noreferrer noopener">Open discussion page</a></p>
                  </article>
                `).join("")}
              </div>
            </article>
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

function renderCommunityManagePage(page) {
  return `
    <div class="section-heading">
      <div>
        <p class="section-kicker">${escapeHtml(page.badge)}</p>
        <h2>${escapeHtml(page.title)}</h2>
        <p class="section-copy">${escapeHtml(page.description)}</p>
      </div>
    </div>
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Keyword focus</p>
          <h3>Keywords used to identify relevant communities and groups</h3>
          <p class="panel-subcopy">Edit this list whenever the focus changes so the Community Intelligence page stays centered on the right warehouse, lakehouse, and analytics conversations.</p>
        </div>
      </div>
      <div class="source-toolbar">
        <button class="secondary-button" type="button" data-add-community-keyword>Add keyword</button>
        <button class="ghost-button" type="button" data-reset-community-keywords>Restore defaults</button>
      </div>
      <p class="toolbar-note">${state.communityKeywords.length} keyword rows in the current view.</p>
      <div class="source-list">
        ${state.communityKeywords.map((keyword, index) => renderCommunityKeywordRow(keyword, index)).join("")}
      </div>
    </article>
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Target platforms</p>
          <h3>Platforms currently in scope for community engagement</h3>
          <p class="panel-subcopy">Maintain this list here so the signal page stays focused on the channels where Netezza announcements, releases, and thought-leadership updates should be shared.</p>
        </div>
      </div>
      <div class="source-toolbar">
        <button class="secondary-button" type="button" data-add-community-platform>Add platform</button>
        <button class="ghost-button" type="button" data-reset-community-platforms>Restore defaults</button>
      </div>
      <p class="toolbar-note">${state.communityPlatforms.length} target platform rows in the current view.</p>
      <div class="source-list">
        ${state.communityPlatforms.map((platform, index) => renderCommunityPlatformRow(platform, index)).join("")}
      </div>
    </article>
  `;
}

function renderCommunityKeywordRow(keyword, index) {
  return `
    <article class="source-row ${keyword.dirty ? "dirty" : ""}">
      <div class="source-name">
        <span class="tone-pill tone-content">KEYWORD</span>
        <div><strong>Focus keyword ${index + 1}</strong><div class="source-subline">Discovery scope</div></div>
      </div>
      <input class="source-input" type="text" value="${escapeAttribute(keyword.value)}" data-community-keyword-input data-keyword-id="${keyword.id}">
      <div class="source-actions">
        <button class="save-button" type="button" data-save-community-keyword data-keyword-id="${keyword.id}">Save</button>
        <button class="delete-button" type="button" data-delete-community-keyword data-keyword-id="${keyword.id}">×</button>
      </div>
    </article>
  `;
}

function renderCommunityPlatformRow(platform, index) {
  return `
    <article class="source-row ${platform.dirty ? "dirty" : ""}">
      <div class="source-name">
        <span class="tone-pill tone-market">PLATFORM</span>
        <div><strong>Target platform ${index + 1}</strong><div class="source-subline">Community channel</div></div>
      </div>
      <input class="source-input" type="text" value="${escapeAttribute(platform.value)}" data-community-platform-input data-platform-id="${platform.id}">
      <div class="source-actions">
        <button class="save-button" type="button" data-save-community-platform data-platform-id="${platform.id}">Save</button>
        <button class="delete-button" type="button" data-delete-community-platform data-platform-id="${platform.id}">×</button>
      </div>
    </article>
  `;
}
function renderSourcePanel(page, filteredSources) {
  const filters = state.filters[page.id];
  const competitorOptions = ["All competitors", ...getCoveredCompetitors(page.id)];
  return `
    <div class="source-toolbar">
      <input type="search" placeholder="Search sources, competitors, or URLs..." value="${escapeAttribute(filters.search)}" data-page-search data-page-id="${page.id}">
      <select data-page-competitor data-page-id="${page.id}">
        ${competitorOptions.map((option) => `<option value="${escapeAttribute(option)}" ${option === filters.competitor ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
      <button class="secondary-button" type="button" data-add-source="${page.id}">Add source</button>
      <button class="ghost-button" type="button" data-reset-sources="${page.id}">Restore defaults</button>
    </div>
    <p class="toolbar-note">${filteredSources.length} source rows in the current view.</p>
    <div class="source-list">
      ${filteredSources.length ? filteredSources.map((source) => renderSourceRow(page.id, page.tone, source)).join("") : `<div class="empty-state">No source rows match the current filter. Try widening the search or switching back to all competitors.</div>`}
    </div>
  `;
}

function renderSourceRow(pageId, tone, source) {
  const url = getDisplayUrl(pageId, source.id);
  const dirty = Boolean(state.drafts[pageId]?.[source.id] !== undefined);
  const hasUrl = Boolean(url.trim());
  return `
    <article class="source-row ${dirty ? "dirty" : ""}">
      <div class="source-name">
        <span class="tone-pill tone-${tone}">${escapeHtml(source.kind)}</span>
        <div><strong>${escapeHtml(source.label)}</strong><div class="source-subline">${escapeHtml(source.competitor)}</div></div>
      </div>
      <input class="source-input" type="text" value="${escapeAttribute(url)}" data-source-url data-page-id="${pageId}" data-source-id="${source.id}">
      <div class="source-actions">
        <a class="open-link ${hasUrl ? "" : "disabled"}" href="${hasUrl ? escapeAttribute(url) : "#"}" target="_blank" rel="noreferrer noopener">Open</a>
        <button class="save-button" type="button" data-save-source data-page-id="${pageId}" data-source-id="${source.id}">Save</button>
        <button class="delete-button" type="button" data-delete-source data-page-id="${pageId}" data-source-id="${source.id}">×</button>
      </div>
    </article>
  `;
}

function renderHighlightCard(highlight, tone) {
  return `<article class="insight-card"><div class="insight-top"><div><span class="tone-pill tone-${tone}">${escapeHtml(highlight.priority)}</span><h3>${escapeHtml(highlight.title)}</h3></div><span class="mini-pill">${escapeHtml(highlight.competitor)}</span></div><p class="insight-copy">${escapeHtml(highlight.summary)}</p><div class="tag-row">${highlight.tags.map((tag) => `<span class="tag tone-${tone}">${escapeHtml(tag)}</span>`).join("")}</div><p class="insight-copy highlight-meta"><strong>Recommended move:</strong> ${escapeHtml(highlight.recommendation)}</p></article>`;
}

function renderDimensionCard(dimension) {
  const isGap = dimension.netezza < 7.5;
  return `<article class="dimension-card"><div class="dimension-top"><div><h3>${escapeHtml(dimension.label)}</h3><p class="dimension-note">${escapeHtml(dimension.note)}</p></div><span class="score-value ${isGap ? "score-value-warn" : ""}">${dimension.netezza.toFixed(1)}</span></div><div class="score-bar"><div class="score-fill ${isGap ? "score-fill-warn" : ""}" style="width:${dimension.netezza * 10}%"></div></div><div class="peer-row">${Object.entries(dimension.competitors).map(([competitor, score]) => `<span class="peer-pill">${escapeHtml(competitor)}: ${score.toFixed(1)}</span>`).join("")}</div></article>`;
}

function renderPillarCard(pillar, index) {
  return `<article class="pillar-card ${escapeHtml(pillar.tone)}"><p class="pillar-label">Pillar ${index + 1} · ${escapeHtml(pillar.title)}</p><p class="pillar-quote">"${escapeHtml(pillar.text)}"</p></article>`;
}

function renderPositioningAngleCard(highlight, tone, index) {
  return `<article class="angle-card positioning-angle-card"><p class="angle-label">Angle ${index + 1}</p><h3>${escapeHtml(highlight.title)}</h3><p class="angle-copy">${escapeHtml(highlight.summary)}</p><div class="tag-row">${highlight.tags.map((tag) => `<span class="tag tone-${tone}">${escapeHtml(tag)}</span>`).join("")}</div><p class="angle-recommendation"><strong>What to say:</strong> ${escapeHtml(highlight.recommendation)}</p></article>`;
}

function renderProductStatus(status) {
  const icon = status === "strong" ? "✓" : status === "partial" ? "◆" : "×";
  return `<span class="product-status-icon ${escapeHtml(status)}">${icon}</span>`;
}

function renderProductGapScore(score) {
  const numeric = Number(score || 0);
  const percentage = Math.max(0, Math.min(100, (numeric / 10) * 100));
  const tone = numeric >= 6 ? "high" : numeric >= 4.5 ? "medium" : "low";
  return `
    <div class="product-gap-score-wrap">
      <div class="product-gap-score-bar"><div class="product-gap-score-fill ${tone}" style="width:${percentage}%"></div></div>
      <strong>${numeric ? numeric.toFixed(1) : "0"}</strong>
    </div>
  `;
}

function renderOverviewSentimentChart() {
  const sentiment = getLiveSectionData("overview")?.sentiment?.length ? getLiveSectionData("overview").sentiment : COMPETITIVE_SENTIMENT;
  return `
    <div class="sentiment-legend">
      <span class="sentiment-legend-item"><span class="sentiment-swatch positive"></span> Positive</span>
      <span class="sentiment-legend-item"><span class="sentiment-swatch neutral"></span> Neutral</span>
      <span class="sentiment-legend-item"><span class="sentiment-swatch negative"></span> Negative</span>
    </div>
    <div class="sentiment-chart">
      <div class="sentiment-y-axis">
        ${[100, 80, 60, 40, 20, 0].map((value) => `<span>${value}%</span>`).join("")}
      </div>
      <div class="sentiment-bars">
        ${sentiment.map((item) => `
          <div class="sentiment-column">
            <div class="sentiment-bar">
              <span class="sentiment-segment positive" style="height:${item.positive}%"></span>
              <span class="sentiment-segment neutral" style="height:${item.neutral}%"></span>
              <span class="sentiment-segment negative" style="height:${item.negative}%"></span>
            </div>
            <span class="sentiment-label">${escapeHtml(shortCompetitorLabel(item.name))}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderOverviewRadarChart() {
  const axes = [
    { label: "Hybrid / On-prem", key: "Hybrid / on-prem deployment" },
    { label: "Query Performance", key: "Predictable query performance" },
    { label: "Compliance", key: "Regulated industry compliance" },
    { label: "SQL Simplicity", key: "SQL-first simplicity for analysts" },
    { label: "TCO Predictability", key: "TCO predictability" },
    { label: "AI / ML Ecosystem", key: "AI / ML ecosystem" },
  ];
  const series = buildOverviewRadarSeries(axes);
  const size = 520;
  const center = 260;
  const radius = 170;
  const rings = [2, 4, 6, 8, 10];

  return `
    <div class="overview-radar-wrap">
      <svg class="overview-radar-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Competitive positioning radar">
        ${rings.map((ring) => `<polygon points="${getRadarPolygonPoints(axes, center, radius * (ring / 10))}" class="overview-radar-ring"></polygon>`).join("")}
        ${axes.map((axis, index) => {
          const end = getRadarPoint(index, axes.length, center, radius + 8);
          const label = getRadarPoint(index, axes.length, center, radius + 38);
          return `
            <line x1="${center}" y1="${center}" x2="${end.x}" y2="${end.y}" class="overview-radar-axis"></line>
            <text x="${label.x}" y="${label.y}" text-anchor="${getRadarTextAnchor(label.x, center)}" class="overview-radar-label">${escapeHtml(axis.label)}</text>
          `;
        }).join("")}
        ${series.map((item) => `
          <polygon points="${getRadarSeriesPoints(item.values, axes, center, radius)}" class="overview-radar-area" style="stroke:${escapeAttribute(item.color)}; fill:${escapeAttribute(withAlpha(item.color, item.name === "IBM Netezza" ? 0.14 : 0.07))}"></polygon>
        `).join("")}
        ${series.map((item) => item.values.map((value, index) => {
          const point = getRadarPoint(index, axes.length, center, radius * (value / 10));
          return `<circle cx="${point.x}" cy="${point.y}" r="${item.name === "IBM Netezza" ? 5.5 : 4}" fill="${escapeAttribute(item.color)}"></circle>`;
        }).join("")).join("")}
      </svg>
      <div class="overview-radar-legend">
        ${series.map((item) => `<span class="overview-radar-legend-item"><span class="overview-radar-legend-box" style="border-color:${escapeAttribute(item.color)}"></span>${escapeHtml(item.name)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderMetricCard(label, value, tone, foot, copy, highlight = false) {
  return `<article class="metric-card ${highlight ? "highlight" : ""}"><p class="panel-kicker">${escapeHtml(label)}</p><div class="metric-value">${escapeHtml(value)}</div><div class="metric-foot ${escapeHtml(tone)}">${escapeHtml(foot)}</div><p class="metric-copy">${escapeHtml(copy)}</p></article>`;
}

function renderSidebarCompetitors() {
  renderSidebarContext();
}

function updateHeaderMeta() {
  refs.lastUpdated.textContent = state.activeSection === "community"
    ? formatDateTime(new Date(state.communityMeta.lastUpdated))
    : state.marketFeed.error || state.liveInsights.meta?.deliveryMode === "static-snapshot"
      ? "Fallback snapshot"
      : state.liveInsights.meta?.generatedAt
        ? formatDateTime(new Date(state.liveInsights.meta.generatedAt))
        : state.marketFeed.meta?.lastUpdated
          ? formatDateTime(new Date(state.marketFeed.meta.lastUpdated))
          : formatDateTime(new Date());
  refs.insightTypeCount.textContent = String(getSectionInsightTypeCount());
  refs.sourceFeedCount.textContent = String(getTotalSourceCount());
}

function getTotalSourceCount() {
  return state.activeSection === "community"
    ? state.communityKeywords.length + state.communityPlatforms.length
    : INSIGHT_PAGES.reduce((sum, page) => sum + getSources(page.id).length, 0);
}

function getSectionInsightTypeCount() {
  return state.activeSection === "community" ? COMMUNITY_PAGES.length : INSIGHT_PAGES.length;
}

function getSources(pageId) {
  return Array.isArray(state.sources[pageId]) ? state.sources[pageId] : [];
}

function getCoveredCompetitors(pageId) {
  return [...new Set(getSources(pageId).map((source) => source.competitor).filter(Boolean))];
}

function getFilteredSources(pageId) {
  const filters = state.filters[pageId];
  const search = filters.search.trim().toLowerCase();
  return getSources(pageId).filter((source) => {
    const url = getDisplayUrl(pageId, source.id).toLowerCase();
    const matchesCompetitor = filters.competitor === "All competitors" || source.competitor === filters.competitor;
    const matchesSearch = !search || [source.kind, source.label, source.competitor, url].join(" ").toLowerCase().includes(search);
    return matchesCompetitor && matchesSearch;
  });
}

function getDisplayUrl(pageId, sourceId) {
  const draft = state.drafts[pageId]?.[sourceId];
  if (draft !== undefined) return draft;
  return getSources(pageId).find((source) => source.id === sourceId)?.url || "";
}

function setActivePage(pageId) {
  const validPages = state.activeSection === "community" ? COMMUNITY_PAGE_IDS : PMM_PAGE_IDS;
  state.activePage = validPages.includes(pageId) && refs.sections[pageId] ? pageId : validPages[0];
  state.activePageBySection[state.activeSection] = state.activePage;
  [...refs.sidebarPageNav.querySelectorAll("[data-page-target]")].forEach((button) => button.classList.toggle("active", button.dataset.pageTarget === state.activePage));
  Object.entries(refs.sections).forEach(([id, section]) => section.classList.toggle("active", id === state.activePage));
  persistShellState();
}

function setActiveSection(sectionId) {
  state.activeSection = sectionId === "community" ? "community" : "pmm";
  renderShell();
  setActivePage(state.activePageBySection[state.activeSection]);
  updateHeaderMeta();
}

function startCommunityAutoRefresh() {
  if (communityRefreshTimer) {
    window.clearInterval(communityRefreshTimer);
  }

  communityRefreshTimer = window.setInterval(() => {
    refreshCommunitySignalPages({ updateTimestamp: true });
    if (state.activeSection === "community") {
      updateHeaderMeta();
    }
  }, COMMUNITY_REFRESH_INTERVAL_MS);
}
function attachEvents() {
  document.addEventListener("click", (event) => {
    const sectionTab = event.target.closest("[data-section-target]");
    if (sectionTab) {
      setActiveSection(sectionTab.dataset.sectionTarget);
      return;
    }

    const pageButton = event.target.closest("[data-page-target]");
    if (pageButton) {
      setActivePage(pageButton.dataset.pageTarget);
      return;
    }

    const openPageButton = event.target.closest("[data-open-page]");
    if (openPageButton) {
      setActivePage(openPageButton.dataset.openPage);
      return;
    }

    const addSourceButton = event.target.closest("[data-add-source]");
    if (addSourceButton) {
      addSource(addSourceButton.dataset.addSource);
      return;
    }

    const addCommunityKeywordButton = event.target.closest("[data-add-community-keyword]");
    if (addCommunityKeywordButton) {
      addCommunityKeyword();
      return;
    }

    const addCommunityPlatformButton = event.target.closest("[data-add-community-platform]");
    if (addCommunityPlatformButton) {
      addCommunityPlatform();
      return;
    }

    const resetButton = event.target.closest("[data-reset-sources]");
    if (resetButton) {
      resetSources(resetButton.dataset.resetSources);
      return;
    }

    const resetCommunityKeywordsButton = event.target.closest("[data-reset-community-keywords]");
    if (resetCommunityKeywordsButton) {
      resetCommunityKeywords();
      return;
    }

    const resetCommunityPlatformsButton = event.target.closest("[data-reset-community-platforms]");
    if (resetCommunityPlatformsButton) {
      resetCommunityPlatforms();
      return;
    }

    const saveButton = event.target.closest("[data-save-source]");
    if (saveButton) {
      saveSource(saveButton.dataset.pageId, saveButton.dataset.sourceId);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-source]");
    if (deleteButton) {
      deleteSource(deleteButton.dataset.pageId, deleteButton.dataset.sourceId);
      return;
    }

    const saveCommunityKeywordButton = event.target.closest("[data-save-community-keyword]");
    if (saveCommunityKeywordButton) {
      saveCommunityKeyword(saveCommunityKeywordButton.dataset.keywordId);
      return;
    }

    const deleteCommunityKeywordButton = event.target.closest("[data-delete-community-keyword]");
    if (deleteCommunityKeywordButton) {
      deleteCommunityKeyword(deleteCommunityKeywordButton.dataset.keywordId);
      return;
    }

    const saveCommunityPlatformButton = event.target.closest("[data-save-community-platform]");
    if (saveCommunityPlatformButton) {
      saveCommunityPlatform(saveCommunityPlatformButton.dataset.platformId);
      return;
    }

    const deleteCommunityPlatformButton = event.target.closest("[data-delete-community-platform]");
    if (deleteCommunityPlatformButton) {
      deleteCommunityPlatform(deleteCommunityPlatformButton.dataset.platformId);
      return;
    }

    const marketFilterButton = event.target.closest("[data-market-filter]");
    if (marketFilterButton) {
      state.marketFeedFilter = marketFilterButton.dataset.marketFilter;
      renderPage("market");
      persistShellState();
      return;
    }

    const marketRefreshButton = event.target.closest("[data-market-refresh]");
    if (marketRefreshButton) {
      loadMarketSignals({ force: true, showLoadingState: true });
      return;
    }

    const communityRefreshButton = event.target.closest("[data-community-refresh]");
    if (communityRefreshButton) {
      refreshCommunitySignalPages({ updateTimestamp: true });
      updateHeaderMeta();
      return;
    }

    const contentOutlineButton = event.target.closest("[data-content-outline]");
    if (contentOutlineButton) {
      const ideaId = contentOutlineButton.dataset.contentOutline;
      state.contentIdeaExpandedId = state.contentIdeaExpandedId === ideaId ? "" : ideaId;
      renderPage("content");
      persistShellState();
      return;
    }

    const pmmActionButton = event.target.closest("[data-pmm-action]");
    if (pmmActionButton) {
      const actionId = pmmActionButton.dataset.pmmAction;
      state.pmmActionExpandedId = state.pmmActionExpandedId === actionId ? "" : actionId;
      renderPage("events");
      persistShellState();
      return;
    }
  });

  document.addEventListener("input", (event) => {
    const sourceInput = event.target.closest("[data-source-url]");
    if (sourceInput) {
      handleSourceDraft(sourceInput.dataset.pageId, sourceInput.dataset.sourceId, sourceInput.value, sourceInput);
      return;
    }

    const keywordInput = event.target.closest("[data-community-keyword-input]");
    if (keywordInput) {
      handleCommunityKeywordDraft(keywordInput.dataset.keywordId, keywordInput.value, keywordInput);
      return;
    }

    const platformInput = event.target.closest("[data-community-platform-input]");
    if (platformInput) {
      handleCommunityPlatformDraft(platformInput.dataset.platformId, platformInput.value, platformInput);
      return;
    }

    const searchInput = event.target.closest("[data-page-search]");
    if (searchInput) {
      state.filters[searchInput.dataset.pageId].search = searchInput.value;
      refreshConfiguredPage(searchInput.dataset.pageId);
      persistShellState();
    }
  });

  document.addEventListener("change", (event) => {
    const competitorSelect = event.target.closest("[data-page-competitor]");
    if (!competitorSelect) {
      return;
    }

    state.filters[competitorSelect.dataset.pageId].competitor = competitorSelect.value;
    refreshConfiguredPage(competitorSelect.dataset.pageId);
    persistShellState();
  });
}

function handleSourceDraft(pageId, sourceId, value, input) {
  state.drafts[pageId] = state.drafts[pageId] || {};
  state.drafts[pageId][sourceId] = value;
  const row = input.closest(".source-row");
  const openLink = row?.querySelector(".open-link");
  const trimmed = value.trim();
  row?.classList.add("dirty");
  if (openLink) {
    openLink.href = trimmed || "#";
    openLink.classList.toggle("disabled", !trimmed);
  }
}

function handleCommunityKeywordDraft(keywordId, value, input) {
  const keyword = state.communityKeywords.find((item) => item.id === keywordId);
  if (!keyword) return;
  keyword.value = value;
  keyword.dirty = true;
  input.closest(".source-row")?.classList.add("dirty");
}

function handleCommunityPlatformDraft(platformId, value, input) {
  const platform = state.communityPlatforms.find((item) => item.id === platformId);
  if (!platform) return;
  platform.value = value;
  platform.dirty = true;
  input.closest(".source-row")?.classList.add("dirty");
}

function saveSource(pageId, sourceId) {
  const source = getSources(pageId).find((item) => item.id === sourceId);
  if (!source) return;

  const draftValue = state.drafts[pageId]?.[sourceId];
  if (draftValue !== undefined) {
    source.url = draftValue.trim();
    delete state.drafts[pageId][sourceId];
    if (!Object.keys(state.drafts[pageId]).length) {
      delete state.drafts[pageId];
    }
  }

  persistAllState();
  refreshConfiguredPage(pageId);
  renderOverview();
  updateHeaderMeta();
}

function deleteSource(pageId, sourceId) {
  state.sources[pageId] = getSources(pageId).filter((source) => source.id !== sourceId);
  if (state.drafts[pageId]) {
    delete state.drafts[pageId][sourceId];
    if (!Object.keys(state.drafts[pageId]).length) delete state.drafts[pageId];
  }
  persistAllState();
  refreshConfiguredPage(pageId);
  renderOverview();
  updateHeaderMeta();
}

function addSource(pageId) {
  const page = PAGE_CONFIG_BY_ID[pageId];
  if (!page) return;

  const nextIndex = getSources(pageId).length + 1;
  const kind = pageId === "events" ? "SIGNAL" : pageId === "market" ? "SOCIAL" : pageId === "product" ? "CAPABILITY" : pageId === "positioning" ? "OWN" : "WEB";
  const competitor = pageId === "positioning" ? "IBM Netezza" : "Custom competitor";
  state.sources[pageId] = [...getSources(pageId), normalizeSource({ id: `${pageId}-custom-${Date.now()}`, kind, label: `Custom ${page.title} source ${nextIndex}`, competitor, url: "" })];
  persistAllState();
  refreshConfiguredPage(pageId);
  renderOverview();
  updateHeaderMeta();
}

function resetSources(pageId) {
  const page = PAGE_CONFIG_BY_ID[pageId];
  if (!page) return;
  state.sources[pageId] = clone(page.sources).map(normalizeSource);
  delete state.drafts[pageId];
  persistAllState();
  refreshConfiguredPage(pageId);
  renderOverview();
  updateHeaderMeta();
}

function addCommunityKeyword() {
  state.communityKeywords = [
    ...state.communityKeywords,
    { id: `community-keyword-${Date.now()}`, value: "", dirty: true },
  ];
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function saveCommunityKeyword(keywordId) {
  const keyword = state.communityKeywords.find((item) => item.id === keywordId);
  if (!keyword) return;
  keyword.value = keyword.value.trim();
  keyword.dirty = false;
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function deleteCommunityKeyword(keywordId) {
  state.communityKeywords = state.communityKeywords.filter((item) => item.id !== keywordId);
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function resetCommunityKeywords() {
  state.communityKeywords = hydrateCommunityKeywords(DEFAULT_COMMUNITY_KEYWORDS);
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function addCommunityPlatform() {
  state.communityPlatforms = [
    ...state.communityPlatforms,
    { id: `community-platform-${Date.now()}`, value: "", dirty: true },
  ];
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function saveCommunityPlatform(platformId) {
  const platform = state.communityPlatforms.find((item) => item.id === platformId);
  if (!platform) return;
  platform.value = platform.value.trim();
  platform.dirty = false;
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function deleteCommunityPlatform(platformId) {
  state.communityPlatforms = state.communityPlatforms.filter((item) => item.id !== platformId);
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function resetCommunityPlatforms() {
  state.communityPlatforms = hydrateCommunityPlatforms(DEFAULT_COMMUNITY_PLATFORMS);
  persistAllState();
  renderPage("community-manage");
  refreshCommunitySignalPages();
  updateHeaderMeta();
}

function refreshCommunitySignalPages({ updateTimestamp = false } = {}) {
  if (updateTimestamp) {
    state.communityMeta.lastUpdated = new Date().toISOString();
    persistShellState();
  }
  renderPage("community-announcements");
  renderPage("community-thought-leadership");
  renderPage("community-replies");
}

function refreshConfiguredPage(pageId) {
  renderPage(pageId);
  renderManagePage();
}

function persistShellState() {
  setStorage(JSON.stringify({
    activeSection: state.activeSection,
    activePage: state.activePage,
    activePageBySection: state.activePageBySection,
    contentIdeaExpandedId: state.contentIdeaExpandedId,
    pmmActionExpandedId: state.pmmActionExpandedId,
    marketFeedFilter: state.marketFeedFilter,
    filters: state.filters,
    sources: getPersistableSources(),
    communityKeywords: getPersistableCommunityKeywords(),
    communityPlatforms: getPersistableCommunityPlatforms(),
    communityMeta: state.communityMeta,
  }));
}

function persistAllState() {
  persistShellState();
}

function getPersistableSources() {
  const persisted = {};
  Object.keys(state.sources).forEach((pageId) => {
    persisted[pageId] = getSources(pageId).map((source) => ({ id: source.id, kind: source.kind, label: source.label, competitor: source.competitor, url: source.url }));
  });
  return persisted;
}

function getPersistableCommunityKeywords() {
  return state.communityKeywords.map((keyword) => keyword.value).filter(Boolean);
}

function getPersistableCommunityPlatforms() {
  return state.communityPlatforms.map((platform) => platform.value).filter(Boolean);
}

function getToneLabel(tone) {
  return { content: "IBM Blue", events: "Green", market: "Amber", product: "Purple", positioning: "Teal" }[tone] || tone;
}

function shortCompetitorLabel(name) {
  return {
    Netezza: "Netezza",
    "IBM Netezza": "IBM Netezza",
    Databricks: "Databricks",
    Snowflake: "Snowflake",
    "Amazon Redshift": "Redshift",
    "Google BigQuery": "BigQuery",
    "Azure Synapse": "Synapse",
    Teradata: "Teradata",
  }[name] || name;
}

function buildOverviewRadarSeries(axes) {
  const competitorMap = [
    { name: "IBM Netezza", color: "#0f62fe", key: "netezza" },
    { name: "Databricks", color: "#e74c3c", key: "Databricks" },
    { name: "Snowflake", color: "#3498db", key: "Snowflake" },
    { name: "Amazon Redshift", color: "#f39c12", key: "Amazon Redshift" },
    { name: "Google BigQuery", color: "#27ae60", key: "Google BigQuery" },
    { name: "Azure Synapse", color: "#9b59b6", key: "Azure Synapse" },
    { name: "Teradata", color: "#e67e22", key: "Teradata" },
  ];

  return competitorMap.map((item) => ({
    name: item.name,
    color: item.color,
    values: axes.map((axis) => {
      const dimension = POSITIONING_DIMENSIONS.find((entry) => entry.label === axis.key);
      return item.key === "netezza" ? dimension.netezza : dimension.competitors[item.key];
    }),
  }));
}

function getRadarSeriesPoints(values, axes, center, radius) {
  return values.map((value, index) => {
    const point = getRadarPoint(index, axes.length, center, radius * (value / 10));
    return `${point.x},${point.y}`;
  }).join(" ");
}

function getRadarPolygonPoints(axes, center, radius) {
  return axes.map((_, index) => {
    const point = getRadarPoint(index, axes.length, center, radius);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function getRadarPoint(index, total, center, radius) {
  const angle = (-Math.PI / 2) + ((Math.PI * 2) * index / total);
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function getRadarTextAnchor(x, center) {
  if (Math.abs(x - center) < 8) return "middle";
  return x < center ? "end" : "start";
}

function withAlpha(hex, alpha) {
  const normalized = hex.replace("#", "");
  const chunk = normalized.length === 3
    ? normalized.split("").map((value) => value + value).join("")
    : normalized;
  const red = Number.parseInt(chunk.slice(0, 2), 16);
  const green = Number.parseInt(chunk.slice(2, 4), 16);
  const blue = Number.parseInt(chunk.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function startMarketAutoRefresh() {
  if (marketRefreshTimer) {
    window.clearInterval(marketRefreshTimer);
  }

  marketRefreshTimer = window.setInterval(() => {
    loadMarketSignals({ showLoadingState: false });
  }, MARKET_REFRESH_INTERVAL_MS);
}

async function loadMarketSignals({ force = false, showLoadingState = true } = {}) {
  const requestId = ++marketRequestSequence;

  if (showLoadingState) {
    state.marketFeed.loading = true;
    state.marketFeed.error = "";
    state.liveInsights.loading = true;
    state.liveInsights.error = "";
    renderPage("market");
  }

  try {
    const { payload, mode } = await fetchWorkspaceIntelligencePayload({ force });
    if (requestId !== marketRequestSequence) {
      return;
    }

    const feed = payload.marketFeed || {};
    state.marketFeed = {
      loading: false,
      error: "",
      meta: feed.meta || payload.meta || state.marketFeed.meta,
      items: Array.isArray(feed.items) && feed.items.length ? feed.items : clone(MARKET_SIGNAL_ITEMS),
    };
    state.liveInsights = {
      loading: false,
      error: "",
      meta: {
        ...(payload.meta || state.liveInsights.meta),
        deliveryMode: mode,
      },
      sections: payload.sections || state.liveInsights.sections,
    };
  } catch (error) {
    if (requestId !== marketRequestSequence) {
      return;
    }

    state.marketFeed = {
      ...state.marketFeed,
      loading: false,
      error: "Live source refresh failed, so this page is showing seeded fallback competitor signals instead of fresh external-source results.",
      items: state.marketFeed.items?.length ? state.marketFeed.items : clone(MARKET_SIGNAL_ITEMS),
    };
    state.liveInsights = {
      ...state.liveInsights,
      loading: false,
      error: "Live insight generation is temporarily unavailable, so the workspace is using seeded strategic recommendations.",
    };
  }

  renderPage("market");
  renderOverview();
  updateHeaderMeta();
}

async function fetchWorkspaceIntelligencePayload({ force = false } = {}) {
  const cacheBust = force ? `?refresh=${Date.now()}` : "";
  const candidateEndpoints = isLocalHost()
    ? [`/api/workspace-intelligence${cacheBust}`, `/.netlify/functions/workspace-intelligence${cacheBust}`]
    : [`/.netlify/functions/workspace-intelligence${cacheBust}`, `/api/workspace-intelligence${cacheBust}`];

  let lastError;

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status} for ${endpoint}`);
      }
      return {
        payload: await response.json(),
        mode: "api",
      };
    } catch (error) {
      lastError = error;
    }
  }

  const snapshotEndpoint = force ? `${STATIC_WORKSPACE_INTELLIGENCE_ENDPOINT}?refresh=${Date.now()}` : STATIC_WORKSPACE_INTELLIGENCE_ENDPOINT;
  const snapshotResponse = await fetch(snapshotEndpoint, { cache: "no-store" });
  if (!snapshotResponse.ok) {
    throw new Error(`Snapshot request failed with ${snapshotResponse.status}`);
  }
  const payload = await snapshotResponse.json();
  return {
    payload,
    mode: "static-snapshot",
    apiError: lastError,
  };
}

function getMarketFeedStatus() {
  const meta = state.marketFeed.meta || {};
  const label = state.marketFeed.loading
    ? "Refreshing live signal feed"
    : state.liveInsights.meta?.deliveryMode === "static-snapshot"
      ? "Fallback snapshot in use"
      : (meta.status || "Live feed active");
  const detail = state.marketFeed.error
    ? "The dashboard is currently using built-in seeded competitor intelligence because the latest live refresh did not complete successfully."
    : state.liveInsights.meta?.deliveryMode === "static-snapshot"
      ? "This shared version is running from a published stakeholder snapshot, so it shows the latest generated dataset rather than calling the local live API."
    : meta.totalSources
      ? `${meta.activeSources || 0} of ${meta.totalSources} sources produced signals${meta.failedSources ? `, ${meta.failedSources} using fallback coverage` : ""}.`
      : "Using competitor webpages, social pages, review sites, and blogs to surface current signals.";
  const updated = state.liveInsights.meta?.generatedAt
    ? `Last refresh: ${formatDateTime(new Date(state.liveInsights.meta.generatedAt))}`
    : meta.lastUpdated
      ? `Last refresh: ${formatDateTime(new Date(meta.lastUpdated))}`
      : "Waiting for first live refresh";

  return {
    label,
    detail,
    updated,
    error: state.marketFeed.error || state.liveInsights.error,
  };
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse saved workspace state", error);
    return null;
  }
}

function getStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to read local storage", error);
    return null;
  }
}

function setStorage(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    console.error("Failed to write local storage", error);
  }
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/\n/g, "&#10;");
}


