# NEAR Transaction Investigator

A web application for investigating NEAR Protocol transactions, examining receipt outcomes, identifying recognised token events, and explaining RPC errors in plain language.

**Live application:** https://near-transaction-investigator.onrender.com  
**Source code:** https://github.com/Web3dakine/near-transaction-investigator

## Overview

NEAR Transaction Investigator helps users understand what happened during a NEAR transaction. It retrieves public transaction data through a server side RPC proxy, examines the transaction and its receipt outcomes, and presents a readable report alongside the underlying technical evidence.

The application also includes a local RPC error inspector. Users can paste an RPC error or a transaction RPC response to inspect it in the browser.

## Features

- Transaction lookup using a NEAR transaction hash and sender account ID.
- Server side RPC requests with fallback across configured NEAR mainnet providers.
- Receipt outcome analysis, including successful, failed, and unrecognised statuses.
- Extraction of failed receipt and contract error details when present in the RPC response.
- Recognition of NEP-141 token events and supported NEP-245 and DIP-4 transfer events in receipt logs.
- Token metadata and current token balance lookups where supported by the token contract.
- Asset movement summaries based on recognised events in the returned receipt logs.
- A plain language explanation with recommended next steps.
- Expandable technical evidence and the original RPC response.
- RPC error inspection with a sample response for local testing.
- Interface and report translations in English, Spanish, French, and Portuguese.

## How it works

1. Enter the transaction hash and the sender account ID.
2. The application sends a read only transaction lookup to its backend.
3. The backend queries configured NEAR mainnet RPC providers and returns the available transaction response.
4. The browser analyses transaction outcomes, receipt logs, and recognised token events.
5. The report presents a plain language explanation and supporting technical evidence.

The application does not require a wallet connection, seed phrase, or private key.

## Run locally

### Requirements

- Node.js 18 or newer
- npm

### Setup

Clone the repository:

```bash
git clone https://github.com/Web3dakine/near-transaction-investigator.git
cd near-transaction-investigator
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Open the application:

```text
http://localhost:3000
```

Check the backend health endpoint:

```text
http://localhost:3000/api/health
```

A healthy response includes a `status` value of `ok`, the service name, and the Node.js runtime version.

## RPC providers

The backend currently tries the following NEAR mainnet endpoints in sequence when a transaction lookup fails:

- NEAR archival RPC
- FastNEAR archival RPC
- FastNEAR mainnet RPC
- NEAR mainnet RPC

Provider availability and archival coverage can vary. A failed lookup does not by itself prove that a transaction failed on chain.

## API

### Transaction lookup

**Endpoint:** `POST /api/rpc`

**Request body:**

```json
{
  "method": "tx",
  "params": [
    "TRANSACTION_HASH",
    "SENDER_ACCOUNT_ID"
  ]
}
```

The backend validates the request and transaction hash format before querying the configured RPC providers.

### Health check

**Endpoint:** `GET /api/health`

Returns the service status and runtime information.

## Important interpretation notes

- A successful top level transaction status does not guarantee that every receipt succeeded.
- Receipt outcomes should be reviewed individually.
- Current token balances are live snapshots retrieved when the report is generated. They are not historical balances at the time of the transaction.
- Token event detection depends on the logs and event formats returned by the RPC response.
- An RPC timeout or provider lookup error does not establish transaction failure.
- A refund should only be treated as confirmed when the available transfer evidence identifies the recipient and amount. A successful follow up receipt alone does not prove that funds were returned.
- The original RPC response remains available in the report so users can inspect the underlying evidence.

## Project status

This is an active hackathon project. The live application and source code are available at the links above.

## License

No open source license has been specified yet. All rights remain with the repository owner unless a license is added.
