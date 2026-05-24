const { createProxyHandler } = require("./_proxy-utils");

exports.handler = createProxyHandler({
  name: "webdiff-snowflake-pricing",
  upstreamEnv: "SNOWFLAKE_PRICING_WEBDIFF_PROXY_URL",
  tokenEnv: "SNOWFLAKE_PRICING_WEBDIFF_PROXY_TOKEN",
  itemsPath: "items",
  titlePath: "title",
  summaryPath: "summary",
  linkPath: "url",
  datePath: "publishedAt",
  limit: 8,
});
