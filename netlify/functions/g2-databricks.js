const { createProxyHandler } = require("./_proxy-utils");

exports.handler = createProxyHandler({
  name: "g2-databricks",
  upstreamEnv: "DATABRICKS_G2_PROXY_URL",
  tokenEnv: "DATABRICKS_G2_PROXY_TOKEN",
  itemsPath: "items",
  titlePath: "title",
  summaryPath: "summary",
  linkPath: "url",
  datePath: "publishedAt",
  limit: 8,
});
