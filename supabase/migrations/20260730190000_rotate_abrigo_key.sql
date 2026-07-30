create or replace function public.rotate_abrigo_key(
  p_current_key_hash text,
  p_new_key_hash text
) returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_current_key_hash is null
    or p_new_key_hash is null
    or p_current_key_hash !~ '^[0-9a-f]{64}$'
    or p_new_key_hash !~ '^[0-9a-f]{64}$'
    or p_current_key_hash = p_new_key_hash then
    raise exception using
      errcode = '22023',
      message = 'invalid request';
  end if;

  if exists (
    select 1
    from public.abrigos
    where key_hash = p_new_key_hash
  ) then
    raise exception using
      errcode = '22023',
      message = 'invalid request';
  end if;

  update public.abrigos
  set
    key_hash = p_new_key_hash,
    updated_at = now()
  where key_hash = p_current_key_hash;

  if not found then
    return false;
  end if;

  return true;

exception
  when unique_violation then
    raise exception using
      errcode = '22023',
      message = 'invalid request';
end;
$$;

revoke all
on function public.rotate_abrigo_key(text, text)
from public;

grant execute
on function public.rotate_abrigo_key(text, text)
to anon;
