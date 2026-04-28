const DEFAULT_TIMEOUT_MS = Number(process.env.PROXY_TIMEOUT_MS || 10_000);

exports.createProxyHandler = function createProxyHandler(config) {
  return async function handler() {
    try {
      const upstreamUrl = process.env[config.upstreamEnv];
      if (!upstreamUrl) {
        return jsonResponse(200, { items: [], meta: { status: `Missing ${config.upstreamEnv}` } });
      }

      const response = await fetchWithTimeout(upstreamUrl, {
        headers: {
          accept: "application/json, text/plain;q=0.9, */*;q=0.8",
          "user-agent": "Netezza-PMM-Source-Proxy/1.0",
          ...buildHeaders(config),
        },
      });

      if (!response.ok) {
        return jsonResponse(200, { items: [], meta: { status: `${config.name} upstream ${response.status}` } });
      }

      const payload = await response.json();
      const items = mapItems(payload, config);

      return jsonResponse(200, {
        items,
        meta: {
          status: "ok",
          connector: config.name,
          upstreamEnv: config.upstreamEnv,
          itemCount: items.length,
        },
      });
    } catch (error) {
      return jsonResponse(200, { items: [], meta: { status: `${config.name} error`, message: error.message } });
    }
  };
};

function mapItems(payload, config) {
  const items = readPath(payload, config.itemsPath || "items");
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => mapItem(item, config, index))
    .filter(Boolean)
    .slice(0, config.limit || 8);
}

function mapItem(item, config, index) {
  const title = cleanText(readPath(item, config.titlePath || "title") || `${config.name} item ${index + 1}`);
  const summary = cleanText(
    readPath(item, config.summaryPath || "summary") ||
    readPath(item, "description") ||
    title
  );
  const url = cleanText(readPath(item, config.linkPath || "url") || readPath(item, "link"));
  const publishedAt = readPath(item, config.datePath || "publishedAt") || readPath(item, "date");

  if (!title || !url) {
    return null;
  }

  return {
    title,
    summary,
    url,
    publishedAt: toIsoDate(publishedAt),
  };
}

function buildHeaders(config) {
  const headers = {};

  if (config.tokenEnv && process.env[config.tokenEnv]) {
    headers.authorization = `Bearer ${process.env[config.tokenEnv]}`;
  }

  if (config.headers && typeof config.headers === "object") {
    Object.assign(headers, config.headers);
  }

  return headers;
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function readPath(value, path) {
  if (!path) {
    return undefined;
  }

  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }
    return current[key];
  }, value);
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toIsoDate(value) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
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
