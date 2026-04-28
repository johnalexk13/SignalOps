import { getMarketSignalsFeed } from "../../market-signals.mjs";

export default async (request) => {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.has("refresh");
    const payload = await getMarketSignalsFeed({ force });

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "market-signals-failed",
      message: error.message,
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
};
