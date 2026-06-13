create table if not exists public.hyperliquid_discovered_wallets (
  wallet_address text primary key check (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  source text not null default 'recent_trades',
  first_seen_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now(),
  assets_seen text[] not null default '{}',
  observed_trade_count integer not null default 0,
  observed_volume_usd numeric not null default 0,
  is_seeded boolean not null default false,
  is_active boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.hyperliquid_wallet_snapshots (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null references public.hyperliquid_discovered_wallets(wallet_address) on delete cascade,
  snapshot_at timestamp with time zone not null,
  account_value numeric,
  total_notional_position numeric,
  gross_exposure numeric,
  net_exposure numeric,
  avg_leverage numeric,
  position_count integer not null default 0,
  unrealized_pnl numeric,
  raw_clearinghouse_state jsonb not null,
  created_at timestamp with time zone not null default now(),
  unique (wallet_address, snapshot_at)
);

create table if not exists public.hyperliquid_positions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null references public.hyperliquid_discovered_wallets(wallet_address) on delete cascade,
  snapshot_at timestamp with time zone not null,
  asset text not null,
  direction text not null check (direction in ('long', 'short', 'flat')),
  size numeric,
  entry_price numeric,
  mark_price numeric,
  position_value numeric,
  leverage numeric,
  unrealized_pnl numeric,
  liquidation_price numeric,
  distance_to_liquidation_pct numeric,
  created_at timestamp with time zone not null default now(),
  unique (wallet_address, snapshot_at, asset)
);

create index if not exists hyperliquid_discovered_wallets_last_seen_idx
  on public.hyperliquid_discovered_wallets (last_seen_at desc);

create index if not exists hyperliquid_wallet_snapshots_wallet_time_idx
  on public.hyperliquid_wallet_snapshots (wallet_address, snapshot_at desc);

create index if not exists hyperliquid_positions_asset_time_idx
  on public.hyperliquid_positions (asset, snapshot_at desc);

create index if not exists hyperliquid_positions_wallet_time_idx
  on public.hyperliquid_positions (wallet_address, snapshot_at desc);

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.hyperliquid_discovered_wallets to service_role;
grant select, insert, update, delete on table public.hyperliquid_wallet_snapshots to service_role;
grant select, insert, update, delete on table public.hyperliquid_positions to service_role;

alter table public.hyperliquid_discovered_wallets enable row level security;
alter table public.hyperliquid_wallet_snapshots enable row level security;
alter table public.hyperliquid_positions enable row level security;

drop policy if exists "Service role manages Hyperliquid discovered wallets" on public.hyperliquid_discovered_wallets;
create policy "Service role manages Hyperliquid discovered wallets"
  on public.hyperliquid_discovered_wallets
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role manages Hyperliquid wallet snapshots" on public.hyperliquid_wallet_snapshots;
create policy "Service role manages Hyperliquid wallet snapshots"
  on public.hyperliquid_wallet_snapshots
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role manages Hyperliquid positions" on public.hyperliquid_positions;
create policy "Service role manages Hyperliquid positions"
  on public.hyperliquid_positions
  for all
  to service_role
  using (true)
  with check (true);
