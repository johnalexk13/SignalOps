import { createReadStream, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { getCommunitySignalsFeed } from "./community-signals.mjs";
import { getMarketSignalsFeed } from "./market-signals.mjs";
import { getWorkspaceIntelligence } from "./workspace-intelligence.mjs";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);
const openAiRealtimeModel = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";

await loadLocalEnv();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;

    if (pathname === "/api/market-signals" || pathname === "/.netlify/functions/market-signals") {
      const force = url.searchParams.has("refresh");
      sendJson(response, 200, await getMarketSignalsFeed({ force }));
      return;
    }

    if (pathname === "/api/pmm-assistant-session" || pathname === "/.netlify/functions/pmm-assistant-session") {
      await handlePmmAssistantSession(request, response);
      return;
    }

    if (pathname === "/api/community-signals" || pathname === "/.netlify/functions/community-signals") {
      const force = url.searchParams.has("refresh");
      sendJson(response, 200, await getCommunitySignalsFeed({
        force,
        productName: url.searchParams.get("product") || "IBM Netezza",
        keywords: url.searchParams.get("keywords") || "",
        platforms: url.searchParams.get("platforms") || "",
      }));
      return;
    }

    if (pathname === "/api/workspace-intelligence" || pathname === "/.netlify/functions/workspace-intelligence") {
      const force = url.searchParams.has("refresh");
      sendJson(response, 200, await getWorkspaceIntelligence({ force }));
      return;
    }

    const sanitizedPath = normalize(pathname).replace(/^(\.\.[\\/])+/, "");
    const filePath = join(rootDir, sanitizedPath);

    if (!filePath.startsWith(rootDir)) {
      sendText(response, 403, "Forbidden");
      return;
    }

    if (!existsSync(filePath)) {
      sendText(response, 404, "Not found");
      return;
    }

    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) {
      sendText(response, 403, "Forbidden");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });

    createReadStream(filePath).pipe(response);
  } catch (error) {
    sendText(response, 500, `Server error: ${error.message}`);
  }
}).listen(port, () => {
  console.log(`SignalOps Product Marketing Insights running at http://localhost:${port}`);
});

async function loadLocalEnv() {
  const candidates = [".env.local", ".env"];

  for (const filename of candidates) {
    try {
      const raw = await readFile(join(rootDir, filename), "utf8");
      raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex <= 0) return;
        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();
        if (!key || process.env[key] !== undefined) return;
        process.env[key] = rawValue.replace(/^["']|["']$/g, "");
      });
    } catch {
      // Local env files are optional.
    }
  }
}

async function handlePmmAssistantSession(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Use POST to create a PMM Assistant Realtime session." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 501, {
      code: "missing_openai_api_key",
      error: "OPENAI_API_KEY is not configured. Add it to .env.local or launch the server with the variable set.",
    });
    return;
  }

  const payload = await readJsonBody(request, 70_000);
  const context = clipText(JSON.stringify(payload.context || {}, null, 2), 18_000);
  const sessionConfig = {
    session: {
      type: "realtime",
      model: process.env.OPENAI_REALTIME_MODEL || openAiRealtimeModel,
      instructions: buildPmmAssistantInstructions(context),
    },
  };

  const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": sanitizeSafetyIdentifier(payload.accountId || "signalops-local"),
    },
    body: JSON.stringify(sessionConfig),
  });
  const data = await safeJson(upstream);

  if (!upstream.ok) {
    sendJson(response, upstream.status, {
      code: "openai_realtime_session_failed",
      error: data?.error?.message || data?.message || "Unable to create OpenAI Realtime session.",
      detail: data,
    });
    return;
  }

  sendJson(response, 200, data);
}

function buildPmmAssistantInstructions(context) {
  return [
    "You are Ask PMM Assistant inside SignalOps, a product marketing intelligence workspace for IBM Netezza.",
    "Answer PMM, product-positioning, competitor, content, battle-card, seller-enablement, and market-signal questions.",
    "Use the provided SignalOps dashboard context as the primary source of truth. It contains crawler status, source URLs, live/static labels, competitor signals, product gaps, positioning guidance, PMM actions, community signals, and uploaded document metadata.",
    "Do not invent competitor claims. If the context does not contain enough current evidence, say that and suggest refreshing Market Signals or adding sources.",
    "When giving recommendations, be concise and structure answers as: Recommendation, Evidence, Source links to inspect, Next PMM action.",
    "Always call out whether the evidence is live, hybrid, or static when that status is available.",
    "Current dashboard context follows:",
    context,
  ].join("\n\n");
}

async function readJsonBody(request, maxBytes) {
  const raw = await readRequestBody(request, maxBytes);
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function readRequestBody(request, maxBytes) {
  let total = 0;
  const chunks = [];

  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function safeJson(response) {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

function sanitizeSafetyIdentifier(value) {
  return String(value || "signalops-local")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 80) || "signalops-local";
}

function clipText(value, length) {
  const text = String(value || "");
  return text.length <= length ? text : `${text.slice(0, length - 3)}...`;
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(message);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}
