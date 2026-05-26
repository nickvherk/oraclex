create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'observer' check (plan in ('observer', 'analyst', 'operator', 'enterprise')),
  created_at timestamp with time zone not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan)
  values (new.id, new.email, 'observer')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null check (plan in ('observer', 'analyst', 'operator', 'enterprise')),
  status text not null default 'pending',
  payment_provider text not null default 'nowpayments',
  payment_id text,
  payment_url text,
  amount_usd numeric,
  expires_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_status_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_status_check
      check (status in ('pending', 'active', 'inactive', 'canceled', 'expired'))
      not valid;
  end if;
end;
$$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text check (plan in ('observer', 'analyst', 'operator', 'enterprise')),
  provider text not null default 'nowpayments',
  provider_payment_id text,
  status text,
  amount_usd numeric,
  raw_payload jsonb,
  created_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id and plan = 'observer');

drop policy if exists "Users can update own profile email" on public.profiles;

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own pending subscriptions" on public.subscriptions;
create policy "Users can create own pending subscriptions"
  on public.subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Future NOWPayments webhook/server routes should use the Supabase service role
-- client to validate NOWPayments payloads, insert payments, and update
-- subscriptions.status to 'active' before upgrading profiles.plan.
