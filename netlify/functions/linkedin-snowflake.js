const { createProxyHandler } = require("./_proxy-utils");

exports.handler = createProxyHandler({
  name: "linkedin-snowflake",
  upstreamEnv: "SNOWFLAKE_LINKEDIN_PROXY_URL",
  tokenEnv: "SNOWFLAKE_LINKEDIN_PROXY_TOKEN",
  itemsPath: "items",
  titlePath: "title",
  summaryPath: "summary",
  linkPath: "url",
  datePath: "publishedAt",
  limit: 8,
});
