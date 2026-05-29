# ReRail Architecture

## Product Flow

1. Organizer creates a campaign and uploads recipients.
2. ReRail validates CSV fields, Stellar public keys, token issuer, and amounts.
3. Organizer funds the campaign treasury and signs claimable-balance creation transactions.
4. Each recipient receives a UUID claim URL.
5. Recipient connects Freighter and signs the inner `claimClaimableBalance` transaction.
6. ReRail's server-side fee payer wraps the signed inner transaction as a fee bump and submits it to Stellar.
7. Campaign status updates from transaction results and indexed chain events.

## MVP Implementation

The current app runs as a Vite/React MVP with local persistence so the whole workflow is usable without external credentials. It includes:

- Campaign dashboard and detail pages
- CSV recipient import and export
- Variable per-recipient amounts
- Claim-link pages
- Freighter wallet connection
- Local claim status updates
- Metrics dashboard
- Stellar SDK transaction helpers
- Vercel-style fee-bump API handler

## Production Backing Services

- Supabase Auth stores organizer identity.
- PostgreSQL tables store campaigns, recipients, and transaction records.
- RLS scopes every campaign and recipient row to `auth.uid()`.
- Vercel Functions hold `FEE_PAYER_SECRET` and submit fee-bump transactions.
- Horizon is used for classic Stellar claimable balance and transaction history.
- Sentry should capture client and server exceptions before launch.

## Stellar Primitives

ReRail uses native Stellar claimable balances rather than a Soroban simulation. The balance has recipient and organizer claimants:

- Recipient can claim before the deadline.
- Organizer can reclaim after the deadline.
- Stellar protocol prevents double-claims.
- Fee-bump transactions let ReRail cover network fees without exposing the fee payer key to browsers.

## Next Production Steps

1. Replace local Zustand persistence with Supabase queries.
2. Add token-scoped server validation before fee-bump submission.
3. Persist transaction hashes after Horizon submission.
4. Add Horizon polling/indexing for claim and reclaim events.
5. Add Sentry and rate limiting on claim execution.
