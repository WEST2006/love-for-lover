-- 在 Supabase SQL Editor 中粘贴全部内容并点击 Run（可重复安全执行）
create table if not exists public.love_space_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.love_space_state enable row level security;

create or replace function public.love_compute_token(p_secret text, p_passcode text)
returns text
language sql
immutable
as $$
  select encode(sha256(convert_to(coalesce(p_secret, '') || ':' || coalesce(p_passcode, ''), 'UTF8')), 'hex');
$$;

create or replace function public.love_sanitize_state(p_data jsonb)
returns jsonb
language sql
immutable
as $$
  select (p_data - 'security') || jsonb_build_object(
    'securityInfo',
    jsonb_build_object(
      'isDefaultPasscode',
      coalesce((p_data->'security'->>'isDefaultPasscode')::boolean, (p_data->'security'->>'passcode') = '5201314')
    ),
    'storageMode',
    'supabase_direct'
  );
$$;

create or replace function public.love_auth_status(p_token text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_data jsonb;
  v_secret text;
  v_pass text;
  v_auth boolean := false;
begin
  select data into v_data from public.love_space_state where id = 'main';
  if v_data is null then
    return jsonb_build_object(
      'authorized', false,
      'title', '我们的心动小屋',
      'loveQuote', '所爱隔山海，山海皆可平',
      'isDefaultPasscode', true,
      'partners', jsonb_build_object(
        'him', jsonb_build_object('name', '男朋友', 'avatarEmoji', '他'),
        'her', jsonb_build_object('name', '女朋友', 'avatarEmoji', '她')
      )
    );
  end if;

  v_secret := v_data->'security'->>'secret';
  v_pass := coalesce(v_data->'security'->>'passcode', '5201314');
  if coalesce(p_token, '') <> '' and p_token = public.love_compute_token(v_secret, v_pass) then
    v_auth := true;
  end if;

  return jsonb_build_object(
    'authorized', v_auth,
    'title', coalesce(v_data->'couple'->>'title', '我们的心动小屋'),
    'loveQuote', coalesce(v_data->'couple'->>'loveQuote', '所爱隔山海，山海皆可平'),
    'isDefaultPasscode', coalesce((v_data->'security'->>'isDefaultPasscode')::boolean, v_pass = '5201314'),
    'partners', jsonb_build_object(
      'him', jsonb_build_object(
        'name', coalesce(v_data->'partners'->'him'->>'name', '男朋友'),
        'avatarEmoji', coalesce(v_data->'partners'->'him'->>'avatarEmoji', '他')
      ),
      'her', jsonb_build_object(
        'name', coalesce(v_data->'partners'->'her'->>'name', '女朋友'),
        'avatarEmoji', coalesce(v_data->'partners'->'her'->>'avatarEmoji', '她')
      )
    )
  );
end;
$$;

create or replace function public.love_unlock(p_passcode text, p_default_state jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_data jsonb;
  v_secret text;
  v_pass text;
begin
  select data into v_data from public.love_space_state where id = 'main';
  if v_data is null then
    v_secret := encode(sha256(convert_to(random()::text || clock_timestamp()::text, 'UTF8')), 'hex');
    v_data := coalesce(p_default_state, '{}'::jsonb) || jsonb_build_object(
      'security', jsonb_build_object(
        'passcode', '5201314',
        'isDefaultPasscode', true,
        'secret', v_secret
      )
    );
    insert into public.love_space_state (id, data, updated_at)
    values ('main', v_data, now())
    on conflict (id) do nothing;
    select data into v_data from public.love_space_state where id = 'main';
  end if;

  v_secret := v_data->'security'->>'secret';
  v_pass := coalesce(v_data->'security'->>'passcode', '5201314');

  if trim(coalesce(p_passcode, '')) <> v_pass then
    raise exception 'INVALID_PASSCODE';
  end if;

  return jsonb_build_object(
    'token', public.love_compute_token(v_secret, v_pass),
    'state', public.love_sanitize_state(v_data)
  );
end;
$$;

create or replace function public.love_get_state(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_data jsonb;
  v_secret text;
  v_pass text;
begin
  select data into v_data from public.love_space_state where id = 'main';
  if v_data is null then
    raise exception 'UNAUTHORIZED';
  end if;
  v_secret := v_data->'security'->>'secret';
  v_pass := coalesce(v_data->'security'->>'passcode', '5201314');
  if coalesce(p_token, '') <> public.love_compute_token(v_secret, v_pass) then
    raise exception 'UNAUTHORIZED';
  end if;
  return jsonb_build_object('state', public.love_sanitize_state(v_data));
end;
$$;

create or replace function public.love_save_state(p_token text, p_next_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_data jsonb;
  v_secret text;
  v_pass text;
  v_merged jsonb;
begin
  select data into v_data from public.love_space_state where id = 'main';
  if v_data is null then
    raise exception 'UNAUTHORIZED';
  end if;
  v_secret := v_data->'security'->>'secret';
  v_pass := coalesce(v_data->'security'->>'passcode', '5201314');
  if coalesce(p_token, '') <> public.love_compute_token(v_secret, v_pass) then
    raise exception 'UNAUTHORIZED';
  end if;

  -- Preserve server-side security object safely
  v_merged := (p_next_data - 'security' - 'securityInfo' - 'storageMode') || jsonb_build_object('security', v_data->'security');

  update public.love_space_state
  set data = v_merged, updated_at = now()
  where id = 'main';

  return jsonb_build_object('state', public.love_sanitize_state(v_merged));
end;
$$;

create or replace function public.love_change_passcode(p_token text, p_new_passcode text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_data jsonb;
  v_secret text;
  v_pass text;
  v_clean text;
  v_updated jsonb;
begin
  select data into v_data from public.love_space_state where id = 'main';
  if v_data is null then
    raise exception 'UNAUTHORIZED';
  end if;
  v_secret := v_data->'security'->>'secret';
  v_pass := coalesce(v_data->'security'->>'passcode', '5201314');
  if coalesce(p_token, '') <> public.love_compute_token(v_secret, v_pass) then
    raise exception 'UNAUTHORIZED';
  end if;

  v_clean := trim(coalesce(p_new_passcode, ''));
  if char_length(v_clean) < 4 or char_length(v_clean) > 24 then
    raise exception 'INVALID_PASSCODE_LENGTH';
  end if;

  v_updated := jsonb_set(
    jsonb_set(v_data, '{security,passcode}', to_jsonb(v_clean)),
    '{security,isDefaultPasscode}',
    'false'::jsonb
  );

  update public.love_space_state
  set data = v_updated, updated_at = now()
  where id = 'main';

  return jsonb_build_object(
    'ok', true,
    'token', public.love_compute_token(v_secret, v_clean),
    'state', public.love_sanitize_state(v_updated)
  );
end;
$$;

grant execute on function public.love_auth_status(text) to anon, authenticated;
grant execute on function public.love_unlock(text, jsonb) to anon, authenticated;
grant execute on function public.love_get_state(text) to anon, authenticated;
grant execute on function public.love_save_state(text, jsonb) to anon, authenticated;
grant execute on function public.love_change_passcode(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
