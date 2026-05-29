create extension if not exists "pgcrypto";

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  token text not null default 'USDC',
  issuer text not null,
  amount_per_recipient numeric not null check (amount_per_recipient > 0),
  total_pool numeric not null check (total_pool >= 0),
  deadline timestamptz,
  status text not null check (status in ('draft', 'active', 'completed', 'expired')),
  treasury_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  email text,
  wallet_address text,
  amount numeric not null check (amount > 0),
  claimable_balance_id text,
  claim_link_token uuid not null default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'claimed', 'expired')),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (claim_link_token)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.recipients(id) on delete cascade,
  tx_hash text not null,
  type text not null check (type in ('create_balance', 'claim', 'reclaim', 'sponsor_account')),
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;
alter table public.recipients enable row level security;
alter table public.transactions enable row level security;

create policy "organizers read campaigns"
  on public.campaigns for select
  using (organizer_id = auth.uid());

create policy "organizers write campaigns"
  on public.campaigns for all
  using (organizer_id = auth.uid())
  with check (organizer_id = auth.uid());

create policy "organizers read recipients"
  on public.recipients for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = recipients.campaign_id
      and campaigns.organizer_id = auth.uid()
    )
  );

create policy "organizers write recipients"
  on public.recipients for all
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = recipients.campaign_id
      and campaigns.organizer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.campaigns
      where campaigns.id = recipients.campaign_id
      and campaigns.organizer_id = auth.uid()
    )
  );

create policy "organizers read transactions"
  on public.transactions for select
  using (
    exists (
      select 1
      from public.recipients
      join public.campaigns on campaigns.id = recipients.campaign_id
      where recipients.id = transactions.recipient_id
      and campaigns.organizer_id = auth.uid()
    )
  );
