// pages/api/search.js
import OpenAI from "openai";

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCORS(res);

  // Always handle preflight with 200 + headers
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are This Is Just Like That — return neighborhoods/cities **in the destination region** that feel like the source place.
- Source place: "${from}"
- Destination region: "${region}"
- Output exactly 3 matches.
- Each match must have: title (formatted “${from} — is just like that (in ${region}): <Area>”), desc (2–3 sentences), tags (3–5 lowercase tags), extra (1 short extra note).
- Return ONLY valid JSON with the shape: {"matches":[{ "title": "...", "desc": "...", "tags": ["..."], "extra":"..." }, ...]}
`;

    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      input: prompt
    });

    const text = resp.output_text;
    const json = JSON.parse(text);

    if (!json?.matches) {
      res.status(502).json({ ok: false, error: "bad_ai_response", raw: debug ? text : undefined });
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
