// pages/api/like.js
export default function handler(req, res) {
  // Basic CORS so Squarespace can call this route
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const { postId } = req.body || {};
      // Mock success (swap for DB later)
      res.status(200).json({ ok: true, message: `liked ${postId ?? "unknown"}` });
    } catch (e) {
      res.status(500).json({ ok: false, error: "server_error" });
    }
    return;
  }

  // Simple GET to confirm the route works
  res.status(200).json({ ok: true, route: "like", method: "GET" });
}
