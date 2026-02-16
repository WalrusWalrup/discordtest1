export const config = { api: { bodyParser: true } };

const keys = globalThis.__KEYS__ || (globalThis.__KEYS__ = {
  "TESTKEY123": { uses: 0, maxUses: 1, expires: Date.now() + 3600_000 }
});

export default function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    console.log("BODY:", req.body); // DEBUG
    const { key, discordId } = req.body || {};
    if (!key || !discordId) return res.status(400).json({ ok: false });

    const data = keys[key];
    if (!data) return res.status(200).json({ ok: false });
    if (data.expires && Date.now() > data.expires) return res.status(200).json({ ok: false });
    if (data.maxUses && data.uses >= data.maxUses) return res.status(200).json({ ok: false });

    data.uses += 1;

    res.status(200).json({ ok: true, uses: data.uses, remaining: data.maxUses - data.uses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
}
