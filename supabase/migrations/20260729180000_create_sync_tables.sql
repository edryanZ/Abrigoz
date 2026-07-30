create table public.abrigos (id uuid primary key default gen_random_uuid(), key_hash text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), last_sync_at timestamptz);
create table public.abrigo_backups (id uuid primary key default gen_random_uuid(), abrigo_id uuid not null references public.abrigos(id) on delete cascade, version integer not null, payload jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (abrigo_id));
create table public.abrigo_devices (id uuid primary key default gen_random_uuid(), abrigo_id uuid not null references public.abrigos(id) on delete cascade, device_id text not null, device_name text not null, created_at timestamptz not null default now(), last_sync_at timestamptz, unique (abrigo_id, device_id));
alter table public.abrigos enable row level security;
alter table public.abrigo_backups enable row level security;
alter table public.abrigo_devices enable row level security;
revoke all on public.abrigos, public.abrigo_backups, public.abrigo_devices from anon, authenticated;
