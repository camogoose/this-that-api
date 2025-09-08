// pages/api/search.js
import OpenAI from "openai";

// CORS: allow requests from your Squarespace page (and anywhere)
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCORS(res);

  // Preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only POST is allowed for this endpoint
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  try {
    const { from, region, debug } = req.body || {};
    if (!from || !region) {
      res.status(400).json({ ok: false, error: "missing_from_or_region" });
      return;
    }

    // OpenAI client (uses your Vercel env var OPENAI_API_KEY)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!client.apiKey) {
      res.status(500).json({ ok: false, error: "missing_openai_api_key" });
      return;
    }

    // Prompt: ask for EXACT JSON with 3 matches
    const system = `You are "This Is Just Like That".
Return neighborhoods/cities IN THE DESTINATION that feel like the SOURCE.
Return ONLY JSON with the exact shape:
{"matches":[{"title":"","desc":"","tags":["",""],"extra":""},{"title":"","desc":"","tags":["",""],"extra":""},{"title":"","desc":"","tags":["",""],"extra":""}]}
No extra text.`;

    const user = `SOURCE: ${from}
DESTINATION: ${region}
Format each title exactly like:
“${from}” — is just like that (in ${region}): <Area>`;

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const text = resp.choices?.[0]?.message?.content || "{}";
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      res.status(502).json({ ok: false, error: "bad_ai_response", raw: text });
      return;
    }

    if (!Array.isArray(json.matches) || json.matches.length === 0) {
      res.status(502).json({ ok: false, error: "no_matches_from_ai", raw: text });
      return;
    }

    res.status(200).json({
      ok: true,
      from,
      region,
      matches: json.matches.slice(0, 3),
      ...(debug ? { debug: { usage: resp.usage } } : {})
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "server_error" });
  }
}
