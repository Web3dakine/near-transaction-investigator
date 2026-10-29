const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const RPCS = [
  'https://archival-rpc.mainnet.fastnear.com',
  'https://rpc.mainnet.fastnear.com',
  'https://rpc.mainnet.near.org'
];

app.get('/', (req, res) => {
  res.send('NEAR Transaction Investigator API is running.');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NEAR Transaction Investigator'
  });
});

app.post('/api/transaction', async (req, res) => {
  const { tx, sender } = req.body;

  if (!tx || !sender) {
    return res.status(400).json({
      error: 'Transaction hash and sender account are required.'
    });
  }

  const errors = [];

  for (const rpc of RPCS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      let response;

      try {
        response = await fetch(rpc, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'near-investigator',
            method: 'tx',
            params: [tx, sender]
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`RPC returned HTTP ${response.status}`);
      }

      if (data.error) {
        throw new Error(
          data.error.message || JSON.stringify(data.error)
        );
      }

      if (!data.result) {
        throw new Error('RPC returned no transaction result.');
      }

      return res.json({
        success: true,
        rpc,
        transaction: data.result
      });
    } catch (error) {
      errors.push({
        rpc,
        error: error.name === 'AbortError'
          ? 'Request timed out'
          : error.message
      });
    }
  }

  return res.status(502).json({
    error: 'All configured NEAR RPC providers failed.',
    details: errors
  });
});

app.listen(PORT, () => {
  console.log(`NEAR Transaction Investigator running on port ${PORT}`);
});
