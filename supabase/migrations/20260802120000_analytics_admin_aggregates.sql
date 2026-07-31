alter table public.analytics_daily
  add column if not exists execution_mode_counts jsonb not null default '{}'::jsonb,
  add column if not exists hour_counts jsonb not null default '{}'::jsonb;

drop function if exists public.record_analytics_event(text,text,text,text,text,text);

create or replace function public.record_analytics_event(
  p_session_token_hash text,
  p_event_name text,
  p_page_name text default null,
  p_device_category text default 'desktop',
  p_app_version text default 'unknown',
  p_error_code text default null,
  p_execution_mode text default 'browser'
) returns boolean
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_page_allowed boolean;
  v_hour text := to_char(v_now at time zone 'UTC', 'HH24');
begin
  if p_session_token_hash !~ '^[A-Za-z0-9_-]{43}$'
    or p_event_name not in ('app_open','page_view','pwa_installed','sync_success',
      'sync_failure','backup_export_started','backup_export_completed','app_error_safe')
    or p_device_category not in ('mobile','tablet','desktop')
    or p_execution_mode not in ('browser','pwa')
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
    version_counts, execution_mode_counts, hour_counts, updated_at)
  values ((v_now at time zone 'UTC')::date,
    (p_event_name = 'app_open')::int, (p_event_name = 'page_view')::int,
    (p_event_name = 'pwa_installed')::int, (p_event_name = 'sync_success')::int,
    (p_event_name = 'sync_failure')::int, (p_event_name = 'app_error_safe')::int,
    case when p_event_name = 'page_view' then jsonb_build_object(p_page_name, 1) else '{}'::jsonb end,
    jsonb_build_object(p_device_category, 1), jsonb_build_object(p_app_version, 1),
    jsonb_build_object(p_execution_mode, 1), jsonb_build_object(v_hour, 1), v_now)
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
    execution_mode_counts = jsonb_set(public.analytics_daily.execution_mode_counts,
      array[p_execution_mode],
      to_jsonb(coalesce((public.analytics_daily.execution_mode_counts ->> p_execution_mode)::bigint, 0) + 1), true),
    hour_counts = jsonb_set(public.analytics_daily.hour_counts, array[v_hour],
      to_jsonb(coalesce((public.analytics_daily.hour_counts ->> v_hour)::bigint, 0) + 1), true),
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
  delete from public.analytics_presence
    where last_seen_at < clock_timestamp() - interval '10 minutes';
  get diagnostics v_count = row_count;
  delete from public.analytics_daily
    where date < (clock_timestamp() at time zone 'UTC')::date - 365;
  return v_count;
end;
$$;

revoke all on function public.record_analytics_event(text,text,text,text,text,text,text) from public;
revoke all on function public.cleanup_analytics_presence() from public;
grant execute on function public.record_analytics_event(text,text,text,text,text,text,text) to anon;
grant execute on function public.cleanup_analytics_presence() to service_role;
