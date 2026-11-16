# NEAR Transaction Investigator Roadmap

This document records planned improvements for NEAR Transaction Investigator. Items are intentions, not claims that the work has been implemented or scheduled for a release.

## Current focus

### Improve refund verification

**Status:** Planned

Improve how the application establishes whether funds were actually returned after a failed or partially failed transaction.

Planned work:

- Trace relevant receipt relationships and outcomes through to a suspected refund.
- Verify transfer evidence, including the asset or token contract, amount, sender and recipient.
- Distinguish confirmed refunds from possible indicators and cases where evidence is insufficient.
- Consider balance comparisons only where reliable historical before and after data is available.
- Explain the evidence and uncertainty in the plain language report.

Important accuracy rule: a successful follow up receipt, a log containing refund wording, or a current balance by itself must not be treated as proof of a historical refund.

Implementation tracking: see the GitHub issue titled **Improve refund verification through receipt and transfer tracing**.

## Further improvement areas

### Transaction diagnosis

Expand recognised contract error patterns and improve the way receipt failures and execution details are explained.

### Asset movement analysis

Expand recognised token event coverage and improve the presentation of asset movements across transaction receipts.

### Plain language reporting

Make reports more informative and precise while keeping them accessible to users who are unfamiliar with NEAR execution details.

### Reliability and test coverage

Add test cases for important transaction scenarios and improve handling of RPC provider failures and incomplete responses.

### User experience and accessibility

Continue improving the mobile experience, interface clarity and language support.

## Working principles

- Preserve the original RPC response and expandable technical evidence.
- Keep explanations grounded in transaction specific evidence.
- Clearly distinguish confirmed facts, possible interpretations and unavailable information.
- Never describe a current balance as a historical balance.
- Never claim a refund was completed without sufficient transfer evidence.
- Keep the application read only. It must not request private keys or sign transactions.

## Status definitions

- **Planned:** Identified as useful work, not yet implemented.
- **In progress:** Implementation has started.
- **Done:** Implemented and verified with appropriate tests.

Update this roadmap as priorities change and as work is implemented.
