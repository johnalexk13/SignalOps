const { createProxyHandler } = require("./_proxy-utils");

exports.handler = createProxyHandler({
  name: "trustradius-bigquery",
  upstreamEnv: "BIGQUERY_TRUSTRADIUS_PROXY_URL",
  tokenEnv: "BIGQUERY_TRUSTRADIUS_PROXY_TOKEN",
  itemsPath: "items",
  titlePath: "title",
  summaryPath: "summary",
  linkPath: "url",
  datePath: "publishedAt",
  limit: 8,
});
