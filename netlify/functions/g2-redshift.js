const { createProxyHandler } = require("./_proxy-utils");

exports.handler = createProxyHandler({
  name: "g2-redshift",
  upstreamEnv: "REDSHIFT_G2_PROXY_URL",
  tokenEnv: "REDSHIFT_G2_PROXY_TOKEN",
  itemsPath: "items",
  titlePath: "title",
  summaryPath: "summary",
  linkPath: "url",
  datePath: "publishedAt",
  limit: 8,
});
