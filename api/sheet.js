const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwFvjySIe7wvyGPMa0o8MuaS1UylmSaBj5RGiaKIOzHh97r6VFgewXSW17rs6uaM3zh/exec';

const CACHE_BY_ACTION = {
  guestbook: 's-maxage=20, stale-while-revalidate=86400',
  accounts: 's-maxage=600, stale-while-revalidate=86400'
};

async function fetchUpstream(action) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    try {
      const r = await fetch(`${SHEET_ENDPOINT}?action=${action}`, { signal: ctrl.signal });
      const json = await r.json();
      clearTimeout(timer);
      if (json && json.ok && Array.isArray(json.data)) return json;
    } catch (e) {
      clearTimeout(timer);
    }
  }
  return null;
}

module.exports = async function handler(req, res) {
  const action = req.query.action;
  if (!CACHE_BY_ACTION[action]) {
    res.status(400).json({ ok: false, error: 'unknown action' });
    return;
  }
  const json = await fetchUpstream(action);
  if (!json) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ ok: false, error: 'upstream failed' });
    return;
  }
  res.setHeader('Cache-Control', `public, ${CACHE_BY_ACTION[action]}`);
  res.status(200).json(json);
};
