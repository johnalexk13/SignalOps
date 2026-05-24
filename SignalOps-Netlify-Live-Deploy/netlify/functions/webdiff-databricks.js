const { createProxyHandler } = require("./_proxy-utils");

exports.handler = createProxyHandler({
  name: "webdiff-databricks",
  upstreamEnv: "DATABRICKS_WEBDIFF_PROXY_URL",
  tokenEnv: "DATABRICKS_WEBDIFF_PROXY_TOKEN",
  itemsPath: "items",
  titlePath: "title",
  summaryPath: "summary",
  linkPath: "url",
  datePath: "publishedAt",
  limit: 8,
});
