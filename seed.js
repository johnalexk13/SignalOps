export function getFallbackPayload() {
  const now = Date.now();
  const signals = [
    makeSignal("snowflake-linkedin-ai-governance", "Snowflake", "LinkedIn", "LinkedIn post", "Snowflake amplifies governance narrative for AI-ready data stacks", "Recent social messaging emphasizes governed AI data access, faster app delivery, and simplified security posture for enterprise teams.", "AI", 0.81, 0.88, "https://www.linkedin.com", now - 18 * 60 * 1000),
    makeSignal("databricks-x-lakehouse", "Databricks", "X", "X post", "Databricks pushes lakehouse migration and open-table momentum", "Short-form updates point to migration accelerators, open formats, and reduced friction for teams consolidating AI and analytics workloads.", "Lakehouse", 0.76, 0.85, "https://x.com", now - 42 * 60 * 1000),
    makeSignal("redshift-blog-performance", "Amazon Redshift", "Blog", "AWS Big Data Blog", "Amazon Redshift blog highlights performance tuning for lower cost analytics", "New technical guidance focuses on workload management, query acceleration, and cost controls for production warehouse environments.", "Performance", 0.79, 0.73, "https://aws.amazon.com/blogs/big-data/", now - 95 * 60 * 1000),
    makeSignal("bigquery-site-pricing", "BigQuery", "Website change", "Website diff", "BigQuery pricing page and feature language appear updated", "Website language suggests stronger emphasis on cost transparency, autoscaling, and integrated AI analysis across workloads.", "Pricing", 0.78, 0.78, "https://cloud.google.com/bigquery", now - 3 * 60 * 60 * 1000),
    makeSignal("teradata-review-migration", "Teradata", "TrustRadius", "TrustRadius reviews", "Trust and migration effort surface in recent Teradata review patterns", "Review commentary suggests customers value scale and ecosystem fit but still mention onboarding complexity and long migration cycles.", "Migration", 0.84, 0.69, "https://www.trustradius.com", now - 4.5 * 60 * 60 * 1000),
    makeSignal("snowflake-g2-performance", "Snowflake", "G2", "G2 review feed", "G2 reviewer feedback continues to mention speed with governance tradeoffs", "Recent rating summaries highlight rapid setup and strong performance, paired with buyer scrutiny on cost management and role complexity.", "Governance", 0.86, 0.71, "https://www.g2.com", now - 6 * 60 * 60 * 1000),
    makeSignal("databricks-site-ai", "Databricks", "Website change", "Website diff", "Databricks homepage shifts more prominently toward AI platform positioning", "Hero copy and navigation changes appear to consolidate analytics, agents, and governance into one platform story.", "AI", 0.8, 0.8, "https://www.databricks.com", now - 7 * 60 * 60 * 1000),
  ];

  return {
    meta: {
      generatedAt: new Date(now).toISOString(),
      status: "Seed Mode",
      competitors: ["Databricks", "Snowflake", "Amazon Redshift", "BigQuery", "Teradata"],
      sources: [...new Set(signals.map((signal) => signal.sourceType))],
    },
    signals,
    competitorScores: [
      { competitor: "Databricks", pressure: 0.83, narrative: "Databricks is leaning hard into AI plus migration momentum." },
      { competitor: "Snowflake", pressure: 0.8, narrative: "Snowflake is turning governance and ease into buyer-facing urgency." },
      { competitor: "Amazon Redshift", pressure: 0.72, narrative: "Redshift is focusing on performance and cost-control proof." },
      { competitor: "BigQuery", pressure: 0.77, narrative: "BigQuery is tightening its pricing and AI story." },
      { competitor: "Teradata", pressure: 0.68, narrative: "Teradata keeps scale credibility but migration friction still shows up." },
    ],
    positioning: [
      { title: "Counter Databricks on AI trust", summary: "Lead with governed hybrid analytics and faster operational adoption where Databricks is expanding its AI platform story.", ownerHint: "Owner: PMM narrative refresh" },
      { title: "Neutralize Snowflake on governance", summary: "Show where Netezza combines enterprise control with lower cost and lower architecture sprawl.", ownerHint: "Owner: Competitive messaging" },
      { title: "Answer BigQuery on cost clarity", summary: "Package predictable deployment economics and migration confidence into clearer ROI proof.", ownerHint: "Owner: Value marketing" },
      { title: "Exploit Teradata migration drag", summary: "Position Netezza as the lower-friction path for modernization programs under delivery pressure.", ownerHint: "Owner: Sales enablement" },
    ],
    reviewsIntel: [
      { title: "Snowflake review theme: governance vs. cost", summary: "Use customer proof that validates strong control without forcing teams into premium sprawl or role-complexity overhead.", ownerHint: "Owner: Customer evidence and advocacy" },
      { title: "Teradata review theme: migration effort", summary: "Collect references that prove faster transition, simpler onboarding, and lower dependency burden for enterprise teams.", ownerHint: "Owner: References program" },
      { title: "Redshift review theme: performance tuning", summary: "Highlight Netezza cases where strong performance does not require constant optimization effort from specialist teams.", ownerHint: "Owner: Solution marketing" },
      { title: "BigQuery review theme: pricing transparency", summary: "Build sharper proof around predictable workload economics and financial governance.", ownerHint: "Owner: Pricing and packaging" },
    ],
    thoughtLeadershipIdeas: [
      { title: "The AI data platform trust gap", summary: "Publish a point of view on why enterprise AI initiatives fail when governance, workload economics, and operational readiness are treated separately.", ownerHint: "Owner: Content and thought leadership" },
      { title: "What buyers should demand from warehouse modernization", summary: "Create an executive guide comparing migration friction, proof-of-value speed, and downstream operating complexity.", ownerHint: "Owner: Executive content" },
      { title: "The hidden cost of platform sprawl in analytics", summary: "Write a field-facing article explaining why more tooling does not always translate into faster business outcomes.", ownerHint: "Owner: Demand generation" },
      { title: "Governed AI without architectural drift", summary: "Develop a practical Netezza-led narrative around AI readiness for regulated and hybrid enterprises.", ownerHint: "Owner: Product marketing content" },
    ],
    actions: [
      { title: "Generate Snowflake counter-brief", summary: "Create a battlecard addendum, one-slide executive summary, and SDR prompt reacting to Snowflake's governance-heavy messaging.", ownerHint: "Owner: PMM launch and field enablement", prompt: "Create a Snowflake competitive counter-brief for Netezza focused on governance, cost predictability, and hybrid analytics trust." },
      { title: "Generate Databricks AI rebuttal asset", summary: "Package a one-pager and webinar abstract that counters Databricks AI platform consolidation claims.", ownerHint: "Owner: PMM launch and field enablement", prompt: "Create a Netezza one-pager that counters Databricks AI platform messaging with enterprise trust and deployment simplicity." },
      { title: "Generate BigQuery pricing proof set", summary: "Draft social snippets and proof points that reinforce Netezza's predictable economics.", ownerHint: "Owner: Value marketing", prompt: "Create proof points and a social-ready narrative about Netezza pricing predictability versus BigQuery." },
      { title: "Generate Teradata migration email pack", summary: "Build a seller-ready outbound sequence focused on migration effort and time-to-value.", ownerHint: "Owner: Sales plays", prompt: "Create a 3-email outbound sequence positioning Netezza against Teradata migration complexity." },
    ],
    capabilitySuggestions: [
      { title: "Sharpen AI governance packaging", summary: "Assess whether Netezza needs stronger product packaging or proof around secure AI-ready data access and governance.", ownerHint: "Owner: Product strategy and PMM" },
      { title: "Improve migration acceleration proof", summary: "Consider reusable tools, services, or published proof that reduce buyer concern around switching effort.", ownerHint: "Owner: Product strategy and PMM" },
      { title: "Publish cost visibility benchmarks", summary: "Strengthen benchmarking and financial guardrail stories for cost-conscious evaluations.", ownerHint: "Owner: Pricing strategy" },
      { title: "Expand performance narrative assets", summary: "Support the product story with stronger benchmarks, workload archetypes, and field proof.", ownerHint: "Owner: Solutions marketing" },
    ],
  };
}

function makeSignal(id, competitor, sourceType, source, title, summary, topic, confidence, urgency, url, publishedAtMs) {
  return {
    id,
    competitor,
    sourceType,
    source,
    title,
    summary,
    topic,
    confidence,
    urgency,
    url,
    publishedAt: new Date(publishedAtMs).toISOString(),
  };
}
