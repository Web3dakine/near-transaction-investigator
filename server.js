const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.join(__dirname, 'public');
const RPCS = [
  'https://rpc.mainnet.fastnear.com',
  'https://rpc.mainnet.near.org'
];

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(Buffer.isBuffer(body) ? body : (typeof body === 'string' ? body : JSON.stringify(body)));
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 32_000) throw new Error('Request body too large');
  }
  return JSON.parse(body || '{}');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { ok: true, service: 'NEAR Transaction Investigator proxy' });
  }

  if (req.method === 'POST' && url.pathname === '/api/rpc') {
    let input;
    try { input = await readBody(req); }
    catch (e) { return send(res, 400, { error: e.message === 'Request body too large' ? e.message : 'Invalid JSON request body' }); }

    // Only allow the read-only transaction methods this prototype needs.
    const allowed = new Set(['tx', 'EXPERIMENTAL_tx_status']);
    if (!allowed.has(input.method) || !Array.isArray(input.params) || input.params.length < 2) {
      return send(res, 400, { error: 'Only tx and EXPERIMENTAL_tx_status with hash and sender parameters are allowed.' });
    }

    const errors = [];
    for (const endpoint of RPCS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 14_000);
      try {
        const upstream = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ jsonrpc: '2.0', id: 'near-investigator', method: input.method, params: input.params })
        });
        const raw = await upstream.text();
        let data;
        try { data = JSON.parse(raw); }
        catch { throw new Error(`${endpoint} returned non-JSON HTTP ${upstream.status}`); }
        if (!upstream.ok) throw new Error(`${endpoint} returned HTTP ${upstream.status}`);
        if (data.error) {
          errors.push({ endpoint, error: data.error });
          // An RPC-level transaction error is meaningful; pass it to the UI.
          return send(res, 200, data);
        }
        return send(res, 200, data);
      } catch (e) {
        errors.push({ endpoint, error: e.name === 'AbortError' ? 'upstream timeout' : e.message });
      } finally { clearTimeout(timer); }
    }
    return send(res, 502, { error: 'All configured NEAR RPC providers failed.', details: errors });
  }

  if (req.method === 'GET') {
    const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const file = path.resolve(ROOT, requested);
    if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    fs.readFile(file, (err, content) => {
      if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
      const type = file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
      send(res, 200, content, type);
    });
    return;
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => console.log(`NEAR Transaction Investigator running on http://localhost:${PORT}`));
