# ReRail

Gasless payout infrastructure for Stellar campaigns. ReRail lets organizers upload recipients, generate claim links, and sponsor claim fees so recipients can receive USDC without holding XLM.

## Current MVP

- React + Vite + TypeScript dashboard
- Campaign creation with CSV import and variable recipient amounts
- Local demo persistence for campaigns, recipients, transactions, and metrics
- Claim-link flow with Freighter connect and gasless-claim state updates
- CSV export for personalized claim URLs
- Stellar SDK helpers for claimable balances, claim transactions, and Horizon submission
- Vercel API scaffold for wrapping a signed inner transaction as a fee-bump transaction

## Run Locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` if you want to override the app URL, Stellar network, USDC issuer, or fee payer secret.

## Production Notes

The UI currently uses local storage so the product flow is testable without Supabase credentials. The next hardening step is replacing the local store with Supabase Auth, Postgres tables from the PRD, RLS policies, and server-side claim execution that validates the claim token before submitting a fee-bump transaction.
