create table if not exists public.analytics_presence (
  session_token_hash text primary key
    check (session_token_hash ~ '^[A-Za-z0-9_-]{43}$'),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_event_at timestamptz,
  device_category text not null
    check (device_category in ('mobile', 'tablet', 'desktop')),
  app_version text not null check (length(app_version) between 1 and 20)
);

create table if not exists public.analytics_daily (
  date date primary key,
  sessions bigint not null default 0 check (sessions >= 0),
  page_views bigint not null default 0 check (page_views >= 0),
  peak_online bigint not null default 0 check (peak_online >= 0),
  pwa_installs bigint not null default 0 check (pwa_installs >= 0),
  sync_successes bigint not null default 0 check (sync_successes >= 0),
  sync_failures bigint not null default 0 check (sync_failures >= 0),
  safe_errors bigint not null default 0 check (safe_errors >= 0),
  approximate_duration_seconds bigint not null default 0,
  module_counts jsonb not null default '{}'::jsonb,
  device_counts jsonb not null default '{}'::jsonb,
  version_counts jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.analytics_presence enable row level security;
alter table public.analytics_daily enable row level security;
revoke all on public.analytics_presence from public, anon, authenticated;
revoke all on public.analytics_daily from public, anon, authenticated;

create or replace function public.analytics_heartbeat(
  p_session_token_hash text,
  p_device_category text,
  p_app_version text
) returns boolean
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_online bigint;
begin
  if p_session_token_hash !~ '^[A-Za-z0-9_-]{43}$'
    or p_device_category not in ('mobile', 'tablet', 'desktop')
    or length(p_app_version) not between 1 and 20 then
    return false;
  end if;
  insert into public.analytics_presence (
    session_token_hash, first_seen_at, last_seen_at, device_category, app_version
  ) values (p_session_token_hash, v_now, v_now, p_device_category, p_app_version)
  on conflict (session_token_hash) do update set
    last_seen_at = case
      when public.analytics_presence.last_seen_at < v_now - interval '30 seconds'
      then v_now else public.analytics_presence.last_seen_at end,
    device_category = excluded.device_category,
    app_version = excluded.app_version;
  delete from public.analytics_presence where last_seen_at < v_now - interval '10 minutes';
  select count(*) into v_online from public.analytics_presence
    where last_seen_at >= v_now - interval '2 minutes';
  insert into public.analytics_daily(date, peak_online, updated_at)
    values ((v_now at time zone 'UTC')::date, v_online, v_now)
  on conflict (date) do update set
    peak_online = greatest(public.analytics_daily.peak_online, excluded.peak_online),
    updated_at = v_now;
  return true;
end;
$$;

create or replace function public.record_analytics_event(
  p_session_token_hash text,
  p_event_name text,
  p_page_name text default null,
  p_device_category text default 'desktop',
  p_app_version text default 'unknown',
  p_error_code text default null
) returns boolean
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_page_allowed boolean;
begin
  if p_session_token_hash !~ '^[A-Za-z0-9_-]{43}$'
    or p_event_name not in ('app_open','page_view','pwa_installed','sync_success',
      'sync_failure','backup_export_started','backup_export_completed','app_error_safe')
    or p_device_category not in ('mobile','tablet','desktop')
    or length(p_app_version) not between 1 and 20 then return false; end if;
  v_page_allowed := p_page_name in ('home','diary','calendar','letters','favorites',
    'goals','habits','statistics','achievements','search','settings');
  if ((p_event_name = 'page_view') is distinct from v_page_allowed)
    or (p_event_name <> 'page_view' and p_page_name is not null)
    or (p_event_name = 'app_error_safe'
      and p_error_code not in ('render_failed','storage_unavailable','network_unavailable'))
    or (p_event_name <> 'app_error_safe' and p_error_code is not null) then return false; end if;
  if exists (select 1 from public.analytics_presence
      where session_token_hash = p_session_token_hash
      and last_event_at > v_now - interval '1 second') then return false; end if;
  perform public.analytics_heartbeat(p_session_token_hash, p_device_category, p_app_version);
  update public.analytics_presence set last_event_at = v_now
    where session_token_hash = p_session_token_hash;
  insert into public.analytics_daily(date, sessions, page_views, pwa_installs,
    sync_successes, sync_failures, safe_errors, module_counts, device_counts,
    version_counts, updated_at)
  values ((v_now at time zone 'UTC')::date,
    (p_event_name = 'app_open')::int, (p_event_name = 'page_view')::int,
    (p_event_name = 'pwa_installed')::int, (p_event_name = 'sync_success')::int,
    (p_event_name = 'sync_failure')::int, (p_event_name = 'app_error_safe')::int,
    case when p_event_name = 'page_view' then jsonb_build_object(p_page_name, 1) else '{}'::jsonb end,
    jsonb_build_object(p_device_category, 1), jsonb_build_object(p_app_version, 1), v_now)
  on conflict (date) do update set
    sessions = public.analytics_daily.sessions + excluded.sessions,
    page_views = public.analytics_daily.page_views + excluded.page_views,
    pwa_installs = public.analytics_daily.pwa_installs + excluded.pwa_installs,
    sync_successes = public.analytics_daily.sync_successes + excluded.sync_successes,
    sync_failures = public.analytics_daily.sync_failures + excluded.sync_failures,
    safe_errors = public.analytics_daily.safe_errors + excluded.safe_errors,
    module_counts = case when p_event_name = 'page_view' then
      jsonb_set(public.analytics_daily.module_counts, array[p_page_name],
        to_jsonb(coalesce((public.analytics_daily.module_counts ->> p_page_name)::bigint, 0) + 1), true)
      else public.analytics_daily.module_counts end,
    device_counts = jsonb_set(public.analytics_daily.device_counts, array[p_device_category],
      to_jsonb(coalesce((public.analytics_daily.device_counts ->> p_device_category)::bigint, 0) + 1), true),
    version_counts = jsonb_set(public.analytics_daily.version_counts, array[p_app_version],
      to_jsonb(coalesce((public.analytics_daily.version_counts ->> p_app_version)::bigint, 0) + 1), true),
    updated_at = v_now;
  return true;
end;
$$;

create or replace function public.cleanup_analytics_presence()
returns bigint language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare v_count bigint;
begin
  delete from public.analytics_presence where last_seen_at < clock_timestamp() - interval '10 minutes';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.get_analytics_admin_summary(
  p_start_date date,
  p_end_date date
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  if p_start_date is null or p_end_date is null or p_start_date > p_end_date
    or p_end_date - p_start_date > 366 then raise exception 'invalid_range'; end if;
  return jsonb_build_object(
    'online_sessions', (select count(*) from public.analytics_presence
      where last_seen_at >= clock_timestamp() - interval '2 minutes'),
    'daily', coalesce((select jsonb_agg(to_jsonb(day) order by day.date)
      from public.analytics_daily day where day.date between p_start_date and p_end_date), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.analytics_heartbeat(text,text,text) from public;
revoke all on function public.record_analytics_event(text,text,text,text,text,text) from public;
revoke all on function public.cleanup_analytics_presence() from public;
revoke all on function public.get_analytics_admin_summary(date,date) from public;
grant execute on function public.analytics_heartbeat(text,text,text) to anon;
grant execute on function public.record_analytics_event(text,text,text,text,text,text) to anon;
grant execute on function public.cleanup_analytics_presence() to service_role;
grant execute on function public.get_analytics_admin_summary(date,date) to service_role;
