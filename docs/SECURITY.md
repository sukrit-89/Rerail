# Security Checklist

## Implemented In MVP

- UUID v4 claim tokens for non-enumerable claim links
- CSV validation for required names, positive amounts, and Stellar public keys
- Fee payer secret isolated to the server API scaffold
- Organizer and recipient private keys are never stored by ReRail
- Claim status is idempotent in local state

## Required Before Production

- Enable Supabase RLS on `campaigns`, `recipients`, and `transactions`
- Verify claim token ownership server-side before fee-bump submission
- Rate limit `POST /api/claim/:token/execute`
- Keep the fee payer account minimally funded
- Add Sentry client/server monitoring
- Add audit logs for create, claim, reclaim, and export actions
- Sanitize exported CSV cells that begin with `=`, `+`, `-`, or `@`
- Validate token issuers against an allowlist for production USDC campaigns
- Store no organizer signing keys server-side
