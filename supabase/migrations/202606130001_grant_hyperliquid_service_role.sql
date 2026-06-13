grant usage on schema public to service_role;

grant select, insert, update, delete on table public.hyperliquid_discovered_wallets to service_role;
grant select, insert, update, delete on table public.hyperliquid_wallet_snapshots to service_role;
grant select, insert, update, delete on table public.hyperliquid_positions to service_role;
