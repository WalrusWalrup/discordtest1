export const config = { api: { bodyParser: true } };

// Load keys from environment variable once, store in globalThis
const keys = globalThis.__KEYS__ || (globalThis.__KEYS__ = (() => {
  try {
    // KEYS_JSON should be something like:
    // [{"key":"TESTKEY123","uses":0,"maxUses":1,"expires":1676496000000}]
    const arr = JSON.parse(process.env.KEYS_JSON || "[]");
    const obj = {};
    arr.forEach(k => {
      obj[k.key] = {
        uses: k.uses || 0,
        maxUses: k.maxUses || 1,
        expires: k.expires || null
      };
    });
    return obj;
  } catch (err) {
    console.error("Invalid KEYS_JSON", err);
    return {};
  }
})());

export default function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const { key, discordId } = req.body || {};
    if (!key || !discordId) return res.status(400).json({ ok: false });

    const data = keys[key];
    if (!data) return res.status(200).json({ ok: false });
    if (data.expires && Date.now() > data.expires) return res.status(200).json({ ok: false });
    if (data.maxUses && data.uses >= data.maxUses) return res.status(200).json({ ok: false });

    data.uses += 1;

    res.status(200).json({ 
      ok: true, 
      uses: data.uses, 
      remaining: data.maxUses - data.uses,
      expires: data.expires
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
}
