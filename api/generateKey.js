export const config = { api: { bodyParser: true } };

const keys = globalThis.__KEYS__ || (globalThis.__KEYS__ = JSON.parse(process.env.KEYS_JSON || "[]"));

function randomKey(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  
  try {
    const { maxUses = 1, expiresMinutes = 60 } = req.body || {};
    const key = randomKey();
    const expires = Date.now() + expiresMinutes * 60_000;

    const newKey = { key, uses: 0, maxUses, expires };
    keys.push(newKey);

    process.env.KEYS_JSON = JSON.stringify(keys) // serverless won't persist this

    res.status(200).json({ ok: true, key, expires, maxUses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
}
