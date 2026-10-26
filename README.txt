NEAR TRANSACTION INVESTIGATOR v0.5

This version serves the web app and proxies read-only transaction lookups through a small Node.js server. This avoids browser CORS restrictions. It does not guarantee that every RPC provider is reachable from every network.

REQUIREMENT
Install Node.js 18 or newer from https://nodejs.org/ if it is not already installed.

RUN LOCALLY ON WINDOWS
1. Extract this ZIP into a normal folder.
2. Open that folder in File Explorer.
3. Click the address bar, type cmd, and press Enter.
4. In the terminal window, type: node --version
   If you see a version such as v20.x or v22.x, continue. If Windows says node is not recognized, install Node.js from nodejs.org, then close and reopen the terminal.
5. Type: npm start
6. Wait for: NEAR Transaction Investigator running on http://localhost:3000
7. Open http://localhost:3000 in your browser. Do not open index.html directly from File Explorer.
8. Try the known test transaction:
   Hash: HA9vatUTiuUT6Yq1Du9qw1nXg6HJ5kxSGoP8db4hDqtx
   Sender: naimul7772.tg
9. If lookup fails, keep the terminal open and share the error shown in the browser and any message printed in the terminal.

HEALTH CHECK
While the server is running, open http://localhost:3000/api/health. It should show {"ok":true,...}.

SECURITY NOTES
The proxy only permits read-only tx and EXPERIMENTAL_tx_status requests. Never enter a seed phrase or private key. This is a development prototype, not production hosting. Before public deployment, add rate limiting and request logging controls.
