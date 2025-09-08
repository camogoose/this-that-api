// pages/api/search.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { from, region } = req.body;

    if (!from || !region) {
      return res.status(400).json({ ok: false, error: "missing_parameters" });
    }

    // Call OpenAI
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful API that suggests similar neighborhoods or areas. Always return 3 results in JSON format with: name, description, and 2-3 tags."
          },
          {
            role: "user",
            content: `Suggest 3 areas in ${region} that are similar to ${from}.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await completion.json();

    // Try to parse the model’s response
    let matches;
    try {
      matches = JSON.parse(data.choices[0].message.content);
    } catch {
      matches = [{ name: "Error parsing results", description: data, tags: [] }];
    }

    res.status(200).json({ ok: true, from, region, matches });
  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ ok: false, error: "server_error" });
  }
}
