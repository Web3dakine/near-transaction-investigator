
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const RPCS = [
  'https://archival-rpc.mainnet.fastnear.com',
  'https://rpc.mainnet.fastnear.com',
  'https://rpc.mainnet.near.org'
];

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NEAR Transaction Investigator'
  });
});

// NEAR RPC proxy used by public/index.html
app.post('/api/rpc', async (req, res) => {
  const { method, params } = req.body || {};

  if (method !== 'tx' || !Array.isArray(params) || params.length < 2) {
    return res.status(400).json({
      error: 'Expected method "tx" with transaction hash and sender account ID in params.'
    });
  }

  const [tx, sender] = params;

  if (
    typeof tx !== 'string' ||
    typeof sender !== 'string' ||
    !tx.trim() ||
    !sender.trim()
  ) {
    return res.status(400).json({
      error: 'Transaction hash and sender account ID are required.'
    });
  }

  const errors = [];

  for (const rpc of RPCS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(rpc, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'near-transaction-investigator',
          method: 'tx',
          params: [tx.trim(), sender.trim()]
        }),
        signal: controller.signal
      });

      const body = await response.text();
      let data;

      try {
        data = JSON.parse(body);
      } catch {
        throw new Error(`RPC returned invalid JSON (HTTP ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(`RPC returned HTTP ${response.status}.`);
      }

      // Return RPC errors as JSON so the frontend can explain them.
      if (data.error) {
        errors.push({
          rpc,
          error: data.error
        });
        continue;
      }

      if (!data.result) {
        errors.push({
          rpc,
          error: 'RPC returned no transaction result.'
        });
        continue;
      }

      return res.json(data);
    } catch (error) {
      errors.push({
        rpc,
        error: error.name === 'AbortError'
          ? 'Request timed out.'
          : error.message
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  return res.status(502).json({
    error: 'All configured NEAR RPC providers failed.',
    details: errors
  });
});

app.listen(PORT, () => {
  console.log(
    `NEAR Transaction Investigator running on port ${PORT}`
  );
});
