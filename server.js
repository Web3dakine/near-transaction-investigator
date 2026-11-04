const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const RPC_PROVIDERS = [
  { name: 'NEAR archival RPC', url: 'https://archival-rpc.mainnet.near.org' },
  { name: 'FastNEAR archival RPC', url: 'https://archival-rpc.mainnet.fastnear.com' },
  { name: 'FastNEAR mainnet RPC', url: 'https://rpc.mainnet.fastnear.com' },
  { name: 'NEAR mainnet RPC', url: 'https://rpc.mainnet.near.org' }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NEAR Transaction Investigator',
    node: process.version
  });
});

app.post('/api/rpc', async (req, res) => {
  const { method, params } = req.body || {};

  if (method !== 'tx' || !Array.isArray(params) || params.length < 2) {
    return res.status(400).json({
      error: 'Expected method "tx" with transaction hash and sender account ID in params.'
    });
  }

  const [hashValue, senderValue] = params;
  const hash = typeof hashValue === 'string' ? hashValue.trim() : '';
  const sender = typeof senderValue === 'string' ? senderValue.trim() : '';

  if (!hash || !sender) {
    return res.status(400).json({
      error: 'Transaction hash and sender account ID are required.'
    });
  }

  // NEAR transaction hashes are base58 encoded 32 byte values.
  if (!/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(hash)) {
    return res.status(400).json({
      error: 'The transaction hash format is invalid. Check that it is the complete NEAR transaction hash.'
    });
  }

  const failures = [];

  for (const provider of RPC_PROVIDERS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'near-transaction-investigator',
          method: 'tx',
          params: [hash, sender]
        }),
        signal: controller.signal
      });

      const responseText = await response.text();
      let payload;

      try {
        payload = JSON.parse(responseText);
      } catch {
        throw new Error(`Provider returned non JSON data (HTTP ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(`Provider returned HTTP ${response.status}: ${payload.message || payload.error?.message || response.statusText}`);
      }

      if (payload.error) {
        const rpcMessage = payload.error.message || JSON.stringify(payload.error);
        failures.push({
          provider: provider.name,
          url: provider.url,
          code: payload.error.code ?? null,
          error: rpcMessage
        });

        // Invalid transaction/hash or sender errors will not be fixed by another provider.
        const message = rpcMessage.toLowerCase();
        if (
          message.includes('invalid transaction') ||
          message.includes('invalid tx') ||
          message.includes('invalid account') ||
          message.includes('invalid base58') ||
          message.includes('does not match')
        ) {
          return res.status(422).json({
            error: 'NEAR rejected the transaction lookup parameters.',
            details: failures
          });
        }
        continue;
      }

      if (!payload.result) {
        failures.push({
          provider: provider.name,
          url: provider.url,
          error: 'Provider returned no transaction result.'
        });
        continue;
      }

      console.log(`[tx] Success via ${provider.name} for ${hash}`);
      return res.json(payload);
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'Provider request timed out after 15 seconds.'
        : error.message;

      failures.push({
        provider: provider.name,
        url: provider.url,
        error: message
      });

      console.error(`[tx] ${provider.name} failed: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  console.error(`[tx] All providers failed for ${hash}`);
  return res.status(502).json({
    error: 'All configured NEAR RPC providers failed to retrieve this transaction.',
    details: failures
  });
});

app.listen(PORT, () => {
  console.log(`NEAR Transaction Investigator listening on port ${PORT}`);
});
