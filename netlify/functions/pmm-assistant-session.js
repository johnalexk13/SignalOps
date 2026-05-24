const DEFAULT_REALTIME_MODEL = "gpt-realtime";

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Use POST to create a PMM Assistant Realtime session." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonResponse(501, {
      code: "missing_openai_api_key",
      error: "OPENAI_API_KEY is not configured. Add it in Netlify environment variables or .env.local for the local launcher.",
    });
  }

  const payload = parseBody(event);
  const context = clipText(JSON.stringify(payload.context || {}, null, 2), 18_000);
  const sessionConfig = {
    session: {
      type: "realtime",
      model: process.env.OPENAI_REALTIME_MODEL || DEFAULT_REALTIME_MODEL,
      instructions: buildPmmAssistantInstructions(context),
    },
  };

  try {
    const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": sanitizeSafetyIdentifier(payload.accountId || "signalops-netlify"),
      },
      body: JSON.stringify(sessionConfig),
    });
    const data = await safeJson(upstream);

    if (!upstream.ok) {
      return jsonResponse(upstream.status, {
        code: "openai_realtime_session_failed",
        error: data?.error?.message || data?.message || "Unable to create OpenAI Realtime session.",
        detail: data,
      });
    }

    return jsonResponse(200, data);
  } catch (error) {
    return jsonResponse(502, {
      code: "openai_realtime_session_failed",
      error: error.message || "Unable to create OpenAI Realtime session.",
    });
  }
};

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

async function safeJson(response) {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function sanitizeSafetyIdentifier(value) {
  return String(value || "signalops-netlify")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 80) || "signalops-netlify";
}

function clipText(value, length) {
  const text = String(value || "");
  return text.length <= length ? text : `${text.slice(0, length - 3)}...`;
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: statusCode === 204 ? "" : JSON.stringify(payload),
  };
}
