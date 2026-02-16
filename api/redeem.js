// in-memory key store (temp)
const keys = globalThis.__KEYS__ || (globalThis.__KEYS__ = {
  // example for TESTING
  "TESTKEY123": {
    uses: 0,
    maxUses: 1,
    expires: Date.now() + 1000 * 60 * 60 // 1 hour
  }
});

export function default handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ok: false});
    return;
  }

  let {key, discordId} = req.body || {};
  if (!key || !discordId) {
    res.status(400).json({ok: false});
    return;
  }

  const data = keys[key];

  if (!data) {
    res.status(200).json({ok: false}); // invalid key
    return;
  }

  if (data.expires && Date.now() > data.expires) {
    res.status(200).json({ ok: false }); // expired
    return;
  }

  if (data.maxUses && data.uses >= data.maxUses) {
    res.status(200).json({ ok: false }); // out of uses
    return;
  }

  data.uses += 1;

  res.status(200).json({
    ok: true,
    uses: data.uses,
    remaining: data.maxUses ? data.maxUses - data.uses : null
  });
}
