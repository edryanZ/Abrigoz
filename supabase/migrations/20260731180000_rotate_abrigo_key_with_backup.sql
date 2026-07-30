create or replace function public.rotate_abrigo_key_with_backup(
  p_current_key_hash text,
  p_new_key_hash text,
  p_version integer,
  p_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_abrigo_id uuid;
begin
  if pg_catalog.jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid request';
  end if;

  if p_current_key_hash !~ '^[a-f0-9]{64}$'
    or p_new_key_hash !~ '^[a-f0-9]{64}$'
    or p_current_key_hash = p_new_key_hash
    or p_version <> 1
    or (
      select count(*)
        from pg_catalog.jsonb_object_keys(p_payload)
    ) <> 8
    or p_payload ->> 'format' <> 'abrigo-encrypted'
    or (p_payload ->> 'version')::integer <> 1
    or p_payload ->> 'purpose' <> 'remote-sync'
    or p_payload ->> 'algorithm' <> 'AES-GCM'
    or p_payload ->> 'keyDerivation' <> 'HKDF-SHA-256'
    or coalesce(length(p_payload ->> 'iv'), 0) < 16
    or coalesce(length(p_payload ->> 'ciphertext'), 0) < 17
    or (p_payload ->> 'createdAt')::timestamptz is null
  then
    raise exception 'invalid request';
  end if;

  select a.id
    into v_abrigo_id
    from public.abrigos as a
   where a.key_hash = p_current_key_hash
   for update;

  if v_abrigo_id is null then
    return false;
  end if;

  if exists (
    select 1
      from public.abrigos as a
     where a.key_hash = p_new_key_hash
       and a.id <> v_abrigo_id
  ) then
    raise exception 'invalid request';
  end if;

  insert into public.abrigo_backups (
    abrigo_id,
    version,
    payload
  )
  values (
    v_abrigo_id,
    p_version,
    p_payload
  )
  on conflict (abrigo_id)
  do update set
    version = excluded.version,
    payload = excluded.payload,
    updated_at = now();

  update public.abrigos
     set key_hash = p_new_key_hash,
         updated_at = now()
   where id = v_abrigo_id;

  return true;
exception
  when unique_violation or invalid_text_representation
    or datetime_field_overflow then
    raise exception 'invalid request';
end;
$$;

revoke all on function public.rotate_abrigo_key_with_backup(
  text,
  text,
  integer,
  jsonb
) from public;

grant execute on function public.rotate_abrigo_key_with_backup(
  text,
  text,
  integer,
  jsonb
) to anon;
