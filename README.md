# NEAR Transaction Investigator

A web application for investigating NEAR Protocol transactions, examining receipt outcomes, identifying recognised token events, and explaining RPC errors in plain language.

**Live application:** https://near-transaction-investigator.onrender.com  
**Source code:** https://github.com/Web3dakine/near-transaction-investigator

## Overview

NEAR Transaction Investigator helps users understand what happened during a transaction on the NEAR blockchain. Users provide a transaction hash and sender account ID. The application retrieves public transaction data through a server side RPC proxy, examines the transaction and its receipt outcomes, and presents a readable report alongside the underlying technical evidence.

NEAR is the source of the transaction and receipt data used by the application. Its RPC interface makes it possible to inspect execution outcomes and receipt logs, which the application analyses to explain transaction behaviour and identify supported token events.

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

## Try the live application

1. Open the [live application](https://near-transaction-investigator.onrender.com).
2. Enter a NEAR transaction hash and the sender account ID in the investigation form.
3. Run the investigation.
4. Review the plain language explanation and recommended next steps.
5. Expand the technical evidence to inspect receipt outcomes, recognised events, and the original RPC response where available.
6. Use the language selector to check the supported interface languages.
7. Open the RPC error inspector to paste and analyse an RPC error or transaction response locally.

For a meaningful transaction report, use a real NEAR transaction hash together with the account ID of the transaction signer. Results depend on the data returned by the configured RPC providers and the event logs emitted by the contracts involved.

## How it works

1. Enter the transaction hash and the sender account ID.
2. The application sends a read only transaction lookup to its backend.
3. The backend queries configured NEAR mainnet RPC providers and returns the available transaction response.
4. The browser analyses transaction outcomes, receipt logs, and recognised token events.
5. The report presents a plain language explanation and supporting technical evidence.

The application does not require a wallet connection, seed phrase, or private key. It performs read only lookups and does not sign or submit transactions.

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

NEAR Transaction Investigator was submitted to NEAR HACKATHON in November 2026. The live application and public source code remain available for review.

## License

See the [LICENSE](LICENSE) file for the terms governing use, modification, and distribution of this project.
