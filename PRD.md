> **Status:** Draft | **Level:** L5 → L6 | **Last Updated:** May 2026
> 

---

## 1. Executive Summary

ReRail is a gasless payout infrastructure platform built on Stellar that enables organizations to distribute USDC rewards, hackathon prizes, scholarships, and community grants through secure, shareable claim links.

Recipients claim funds without ever holding XLM. Organizers manage campaigns through a clean dashboard. Every distribution is on-chain, transparent, and auditable with zero manual overhead.

**One-line pitch:** "Set up a grant. Send a link. Get paid — no wallet setup required."

**Belt level:** Stellar Rise In Belt Program — Level 5 (MVP) → Level 6 (Production Scale)

---

## 2. Problem Statement

Organizations frequently need to distribute funds to dozens or hundreds of recipients — hackathon prizes, scholarships, DAO contributor rewards, open-source bounties, grant programs. Existing methods all fail in critical ways.

| Method | Failure Mode |
| --- | --- |
| Bank wire | Slow, cross-border fees, requires bank accounts in both countries |
| PayPal / Stripe | Geographic restrictions, 3–5% platform fees, chargeback risk |
| Manual crypto send | Recipients need ETH/gas tokens, confusing UX for non-crypto users |
| Gitcoin | Ethereum-native, complex setup, overkill for small or focused distributions |
| CSV airdrop scripts | Manual, error-prone, no tracking, recipient must already have a funded wallet |

### The Five Specific Problems ReRail Solves

1. **Onboarding friction** — Recipients don't have Freighter wallets or any XLM for fees
2. **Bulk setup burden** — No existing tool lets organizers upload a CSV and generate claim links in bulk
3. **Zero tracking** — Organizers can't see in real-time who claimed, who didn't, and why
4. **Non-crypto UX wall** — Students and grant recipients shouldn't need blockchain knowledge to receive money
5. **No trustless proof** — Recipients have no on-chain proof their funds are actually reserved before they complete required work

---

## 3. Solution Overview

ReRail compresses the full distribution workflow into three steps:

1. **Create a campaign** — set pool size, per-recipient amount, and optional deadline
2. **Upload recipients** — CSV with name, email, and wallet address (wallet optional at upload time)
3. **Send claim links** — each recipient gets a unique URL; they claim gaslessly from any device

Under the hood, ReRail uses **Stellar's native Claimable Balances** to lock funds on-chain per recipient and **Fee Bump Transactions** to sponsor every single claim so recipients never pay XLM. This is not a Soroban simulation — these are first-class Stellar protocol primitives.

---

## 4. Target Users

### User Segments

| Segment | Use Case | Recipient Volume |
| --- | --- | --- |
| Hackathon Organizers | Prize distribution to 10–200 winners | High |
| Scholarship Programs | Stipends to students without crypto wallets | High |
| DAOs | Monthly contributor rewards | Medium |
| Startup Accelerators | Milestone-based grants to portfolio companies | Medium |
| Open Source Communities | Bounty payouts to GitHub contributors | Medium |
| Universities | Research grants, bootcamp completion rewards | Medium |

### User Personas

- Persona 1: Priya — Hackathon Organizer
    
    **Role:** DevRel at a Web3 protocol
    
    **Context:** Running a 3-day hackathon with 12 prize tracks and 40 total winners across teams
    
    **Pain:** Manually DMing every winner, collecting wallet addresses over 2 weeks, then sending USDC one by one and following up when people don't respond
    
    **Goal:** Finish all prize distribution within 2 hours of the hackathon ending
    
    **Technical level:** Web3-native, understands gas but hates managing it for 40 other people
    
- Persona 2: Arjun — Scholarship Program Manager
    
    **Role:** Coordinator at a university coding club
    
    **Context:** Distributing USDC equivalent to 20 students who completed an 8-week online course
    
    **Pain:** Students don't have crypto wallets. Each wallet setup session takes 45 minutes per student, and half drop off midway.
    
    **Goal:** Send a link to each student. They click it. Money arrives. No blockchain knowledge required.
    
    **Technical level:** Non-crypto. The recipient UX must be zero-friction.
    
- Persona 3: Marcus — DAO Treasurer
    
    **Role:** Multi-sig signer for a 50-member open source DAO
    
    **Context:** Monthly contributor rewards ranging from $50–200 USDC based on participation scores
    
    **Pain:** Manual tracking of contributions, then manual sends, then reconciliation spreadsheets, then chasing people who missed the payout window
    
    **Goal:** Upload a CSV of wallet addresses plus amounts. Hit send. Done.
    
    **Technical level:** Crypto-native. Values on-chain transparency and auditability above all.
    
- Persona 4: Sofia — Open Source Maintainer
    
    **Role:** Maintainer of a widely-used CLI developer tool
    
    **Context:** Received a foundation grant and wants to distribute bounties to 30 contributors
    
    **Pain:** Most GitHub contributors don't have Stellar wallets. Asking them to set one up loses 70% of recipients before they even try.
    
    **Goal:** Contributor merges a PR. Contributor gets a claim link automatically. (Future scope: GitHub Actions integration)
    
    **Technical level:** Developer-native, not necessarily crypto-native.
    

---

## 5. Core User Flows

### Flow A: Organizer Creates a Campaign

```
Login → Dashboard → Create Campaign
  → Set: Campaign Name, Token (USDC), Amount per recipient, Total pool, Deadline (optional)
  → Upload CSV: columns — name, email, wallet_address (wallet_address optional)
  → Preview screen: total USDC needed + estimated XLM reserve cost
  → Fund Campaign: deposit USDC to campaign treasury address
  → Generate Claim Links: createClaimableBalance on-chain for each recipient
  → Share: download CSV with personalized claim URLs, or send via email
```

### Flow B: Recipient Claims Funds

```
Open Claim Link → Landing page shows: "X USDC is reserved for you"
  → Connect Wallet (Freighter)
        OR
  → Create New Wallet (ReRail sponsors account creation)
  → Click Claim
  → Fee Bump Transaction wraps claimClaimableBalance
  → USDC lands in wallet — recipient never pays XLM
  → Success screen with transaction hash link
```

### Flow C: Organizer Tracks Campaign Progress

```
Dashboard → Campaign Detail
  → Recipient table: Name | Amount | Status (Pending/Claimed/Expired) | Claimed At
  → Live updates as claims come in
  → Export table as CSV for records
  → After deadline: Reclaim expired balances back to treasury
```

---

## 6. Feature Requirements

### L5 MVP Features

| Feature | Priority | Description |
| --- | --- | --- |
| Campaign creation | P0 | Name, token, per-recipient amount, pool size, optional deadline |
| CSV upload | P0 | Parse name, email, wallet_address; handle missing wallets gracefully |
| Claimable Balance creation | P0 | `createClaimableBalance` per recipient with optional time predicate |
| Unique claim links | P0 | UUID-based URL per recipient, tied to their specific balance ID |
| Gasless claim flow | P0 | Fee Bump Transaction wraps `claimClaimableBalance` |
| Campaign dashboard | P0 | Real-time status per recipient: Pending / Claimed / Expired |
| Freighter wallet connect | P1 | @stellar/freighter-api integration on claim page |
| Sponsored account creation | P1 | `createAccount`  • trustline sponsored for recipients without wallets |
| Time predicate / deadline | P1 | Claimable balance auto-expiry using Stellar time predicates |
| Expired balance reclaim | P1 | Organizer reclaims unclaimed USDC after deadline passes |
| Email notification | P2 | Claim link delivery via Resend API |

### L6 Production Additions

| Feature | Priority | Description |
| --- | --- | --- |
| Variable amounts per recipient | P0 | Different USDC amounts per row in CSV upload |
| Metrics dashboard | P0 | DAU, total transactions, claim rate — L6 hard requirement |
| Monitoring + error logging | P0 | Sentry integration for production error tracking |
| Security checklist completion | P0 | Input validation, rate limiting, key management documented |
| Data indexing | P1 | Index claimable balance events for fast historical queries |
| Multi-token support | P1 | Any Stellar asset, not just USDC |
| Campaign analytics | P1 | Time-to-claim median, drop-off rate, geographic distribution |
| Community contribution | P1 | Twitter announcement post + Stellar community forum post |
| Advanced feature: Fee Sponsorship | P0 | Fully implemented and documented as the L6 advanced feature |

---

## 7. Technical Architecture

### System Overview

```
[Organizer Browser]
        ↓
[React + Vite + TypeScript Frontend]  ←──→  [Supabase (Auth + PostgreSQL + RLS)]
        ↓
[Stellar SDK (JS) + Horizon API]
        ↓
[Stellar Network — Testnet → Mainnet]
        ↙                      ↘
[Claimable Balances]    [Fee Bump Transactions]
                                ↑
                    [ReRail Fee Payer Account]

[Recipient Browser]
        ↓
[Claim Page (React)]
        ↓
[Freighter Wallet / Sponsored New Account]
        ↓
[Fee Bump Transaction → Stellar Network]
```

### Frontend Stack

| Layer | Technology |
| --- | --- |
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Design tokens | `#080808` background, `#22c55e` accent, IBM Plex Sans / IBM Plex Mono |
| Wallet | @stellar/freighter-api |
| Stellar SDK | stellar-sdk (JS) |
| State management | Zustand |
| Routing | React Router v6 |
| Hosting | Vercel |

### Backend / Off-chain

| Layer | Technology |
| --- | --- |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Security | Row Level Security — organizer only reads/writes their own campaigns |
| File storage | Supabase Storage (CSV exports) |
| Email (P2) | Resend API |

---

## 8. Stellar Integration Details

### Why Native Stellar Primitives, Not Soroban (for L5)

Claimable Balances and Fee Bump Transactions are **first-class Stellar protocol operations** — not smart contract simulations. They are more efficient, more battle-tested, and have better tooling than equivalent Soroban contracts would. Using them directly is architecturally correct, not a shortcut.

### Claimable Balance Creation

```jsx
// Two claimants: recipient can claim before deadline,
// organizer can reclaim after deadline
Operation.createClaimableBalance({
  asset: new Asset('USDC', USDC_ISSUER),
  amount: '50',
  claimants: [
    new Claimant(
      recipientPublicKey,
      Claimant.predicateBeforeRelativeTime('604800') // 7 days
    ),
    new Claimant(
      organizerPublicKey,
      Claimant.predicateNot(
        Claimant.predicateBeforeRelativeTime('604800')
      ) // organizer can reclaim AFTER 7 days
    )
  ]
})
```

### Gasless Claim — Fee Bump Transaction

```jsx
// 1. Build inner transaction (recipient pays no fee in practice)
const innerTx = new TransactionBuilder(recipientAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(Operation.claimClaimableBalance({ balanceId }))
  .setTimeout(30)
  .build();

// 2. Recipient signs via Freighter (no XLM balance required for fee)
const signedInner = await signTransaction(innerTx.toXDR());

// 3. ReRail's fee payer account wraps it — fee payer covers the cost
const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
  FEE_PAYER_KEYPAIR,       // server-side env secret
  BASE_FEE * 10,
  TransactionEnvelope.fromXDR(signedInner),
  Networks.TESTNET
);
feeBumpTx.sign(FEE_PAYER_KEYPAIR);

await server.submitTransaction(feeBumpTx);
```

### Sponsored Account Creation (for non-wallet recipients)

```jsx
// For recipients who don't yet have a Stellar account
// All reserve requirements paid by the organizer / platform sponsor
const sponsorOps = [
  Operation.beginSponsoringFutureReserves({
    sponsoredId: newAccountPublicKey
  }),
  Operation.createAccount({
    destination: newAccountPublicKey,
    startingBalance: '0'
  }),
  Operation.changeTrust({
    asset: USDC_ASSET,
    source: newAccountPublicKey  // USDC trustline, also sponsored
  }),
  Operation.endSponsoringFutureReserves({
    source: newAccountPublicKey
  }),
];
// Net cost to recipient: 0 XLM
```

### L6 Optional: Soroban Campaign Registry

For full on-chain auditability in L6, a lightweight Soroban contract can serve as a campaign registry — removing reliance on Supabase for the authoritative record:

```rust
// Pseudocode
pub fn create_campaign(env: Env, organizer: Address, campaign_id: Symbol, total: i128);
pub fn mark_claimed(env: Env, balance_id: Bytes, recipient: Address);
pub fn get_stats(env: Env, campaign_id: Symbol) -> CampaignStats;
```

This enables fully verifiable audit trails and Stellar-native data indexing via contract events. Decision point: evaluate after L5 completion.

---

## 9. Database Schema

### campaigns

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| organizer_id | uuid FK | → auth.users |
| name | text | Campaign display name |
| token | text | Asset code (e.g. USDC) |
| issuer | text | Asset issuer Stellar address |
| amount_per_recipient | numeric | Default amount; overrideable per recipient |
| total_pool | numeric | Total USDC deposited to treasury |
| deadline | timestamptz | Optional — drives time predicate |
| status | text | draft / active / completed / expired |
| treasury_address | text | Stellar account holding pool funds |
| created_at | timestamptz |  |

### recipients

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| campaign_id | uuid FK | → campaigns |
| name | text |  |
| email | text | Optional |
| wallet_address | text | Optional at upload; required before claim link activation |
| amount | numeric | Individual override; falls back to campaign default |
| claimable_balance_id | text | Stellar balance ID (populated after on-chain creation) |
| claim_link_token | text | UUID v4 used in claim URL |
| status | text | pending / claimed / expired |
| claimed_at | timestamptz |  |

### transactions

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| recipient_id | uuid FK | → recipients |
| tx_hash | text | Stellar transaction hash |
| type | text | create_balance / claim / reclaim / sponsor_account |
| created_at | timestamptz |  |

---

## 10. Security Model

### Threat Model

| Threat | Mitigation |
| --- | --- |
| Organizer reclaims funds before deadline | Claimable balance claimant predicate — organizer's predicate only activates after deadline passes |
| Guessable / enumerable claim links | Claim tokens are UUID v4 — 2^122 entropy space |
| Fee payer account drained | Rate limiting on `/api/claim/:token/execute`, fee payer holds minimal XLM top-ups |
| Recipient double-claiming | Stellar protocol rejects second `claimClaimableBalance` on an already-claimed balance — idempotent by design |
| Cross-organizer data access | Supabase Row Level Security — every query scoped to `organizer_id = auth.uid()` |
| Fee payer key exposure | Keypair is a Vercel environment secret, never bundled in client code |
| CSV injection attack | Sanitize all CSV fields, validate Stellar addresses with `StrKey.isValidEd25519PublicKey()` |

### Key Management Principles

- Organizer signing keys **never touch ReRail servers** — all organizer transactions signed via Freighter in-browser
- Fee payer keypair stored as a server-side Vercel environment secret
- Fee payer account holds only enough XLM for approximately 100 fee bumps — refilled in batches
- No custodial keys for recipient funds — funds live entirely in Stellar's native claimable balance primitive until claimed

---

## 11. Metrics & Success Criteria

### L5 Targets

| Metric | Target |
| --- | --- |
| Verified testnet users | 5+ (wallet addresses on Stellar Explorer) |
| Campaigns created | 3+ |
| Successful gasless claims | 10+ |
| Google Form feedback responses | 5+ |
| Documented iterations from feedback | 1 (with git commit link in README) |

### L6 Targets

| Metric | Target |
| --- | --- |
| Verified active users | 30+ wallet addresses |
| Total on-chain transactions | 100+ |
| Claim success rate | > 90% |
| Median time to claim | < 3 minutes from link open |
| DAU (live metrics dashboard) | Tracked and displayed |
| Monitoring uptime | Active (Sentry or equivalent) |

---

## 12. Roadmap

### Phase 1 — L5 MVP (Month 1)

- [ ]  Stellar SDK integration — Claimable Balances + Fee Bump
- [ ]  Campaign creation UI + CSV upload with validation
- [ ]  On-chain balance creation per recipient (batch transaction flow)
- [ ]  Claim link generation (UUID tokens)
- [ ]  Gasless claim page with Freighter connect
- [ ]  Fee Bump Transaction implementation (server-side fee payer)
- [ ]  Organizer dashboard with real-time claim status
- [ ]  Expired balance reclaim flow
- [ ]  5 testnet users onboarded
- [ ]  Google Form + Excel export + 1 documented iteration
- [ ]  Architecture doc + 10+ commits

### Phase 2 — L6 Production (Month 2)

- [ ]  Variable per-recipient amounts in CSV
- [ ]  Sponsored account creation for non-wallet recipients
- [ ]  Metrics dashboard (DAU, transaction count, claim rate)
- [ ]  Sentry error monitoring
- [ ]  Security checklist completion
- [ ]  Data indexing via Horizon pagination or Soroban contract events
- [ ]  Multi-token support (any Stellar asset)
- [ ]  30 verified active users
- [ ]  Twitter announcement post + Stellar community forum
- [ ]  Advanced feature documentation (Fee Sponsorship)
- [ ]  Demo Day slide deck + live demo

---

## 13. Open Questions

| Question | Options | Current Recommendation |
| --- | --- | --- |
| Wallet creation for non-Stellar users | (A) Custodial flow, (B) Freighter-only + setup guide | Freighter-only for L5; add sponsored creation for L6 |
| Fee payer sustainability model | (A) ReRail subsidizes, (B) Organizer deposits XLM at campaign creation | Organizer deposits a small XLM buffer at campaign setup |
| USDC trustline for new accounts | Must be in same sponsored transaction batch as account creation | Implement in sponsored account flow — cannot be skipped |
| Soroban campaign registry for L6 | (A) Stay native Stellar, (B) Add Soroban contract for audit trail | Decision point after L5 ships |
| Email delivery infrastructure | Requires a verified sending domain (Resend) | Manual link sharing for L5; production email for L6 |

---

## 14. Submission Checklist

### L5 Checklist

- [ ]  MVP fully functional on Stellar testnet
- [ ]  5+ testnet users with verified wallet addresses (Stellar Explorer links)
- [ ]  Google Form collecting: wallet address, email, name, product rating
- [ ]  Responses exported to Excel, linked in README
- [ ]  1 iteration documented with git commit link in README
- [ ]  Architecture document committed to repo
- [ ]  10+ meaningful commits
- [ ]  Live demo deployed on Vercel
- [ ]  Demo video recorded and linked

### L6 Checklist

- [ ]  30+ active users with verified wallet addresses
- [ ]  Metrics dashboard live (DAU, transactions, claim rate)
- [ ]  Security checklist completed and linked in README
- [ ]  Monitoring active (Sentry dashboard screenshot)
- [ ]  Data indexing implemented and described
- [ ]  Full technical documentation + user guide
- [ ]  1 community contribution (Twitter post linked)
- [ ]  Advanced feature: Fee Sponsorship fully implemented and documented
- [ ]  30+ total meaningful commits (15+ in this phase)
- [ ]  Demo Day presentation prepared and rehearsed