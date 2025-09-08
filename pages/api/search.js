// pages/api/search.js
export default async function handler(req, res) {
  // Allow Squarespace to call this
  res.setHeader("Access-Control-Allow-Origin", "https://www.vorrasi.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { from, region } = req.body;

    // Example matches (replace later with real OpenAI call)
    const matches = [
      { place: "Bay View, Milwaukee", reason: "Artsy vibes + waterfront access" },
      { place: "Downtown Madison", reason: "Lively cultural hub with festivals" },
      { place: "Milwaukee’s East Side", reason: "Trendy cafes + youthful energy" }
    ];

    res.status(200).json({ ok: true, from, region, matches });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "server_error" });
  }
}
