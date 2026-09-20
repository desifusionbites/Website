begin;

-- Bind every order to an immutable Supabase user id. Existing orders are
-- backfilled only when their email belongs to a confirmed account.
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_orders_user_id on public.orders(user_id);

update public.orders as orders
set user_id = users.id
from auth.users as users
where orders.user_id is null
  and users.email_confirmed_at is not null
  and lower(orders.customer_email) = lower(users.email);

-- Put the RLS helper behind a non-exposed schema. It deliberately checks the
-- authoritative auth.users confirmation timestamp before returning privileges.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select profiles.role
      from public.profiles as profiles
      join auth.users as users on users.id = profiles.id
      where profiles.id = (select auth.uid())
        and users.email_confirmed_at is not null
    ),
    'anonymous'
  );
$$;

revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role() to anon, authenticated;

-- Keep the existing policy API stable without exposing a SECURITY DEFINER
-- function through PostgREST.
create or replace function public.current_user_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select private.current_user_role();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to anon, authenticated;

-- A profile is always created as a customer. Privileged roles are assigned
-- explicitly by an existing confirmed owner; an email address alone can never
-- bootstrap owner access.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(trim(new.email)),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    'customer'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
      updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Users may edit their display name, but identity and authorization fields are
-- immutable through the public profile endpoint. Only a confirmed owner may
-- change another profile's role.
create or replace function public.check_profile_role_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id or new.email is distinct from old.email then
    raise exception 'Profile identity fields cannot be changed here.';
  end if;

  if new.role is distinct from old.role
     and private.current_user_role() <> 'owner' then
    raise exception 'Only the account owner can change user roles.';
  end if;

  return new;
end;
$$;

revoke all on function public.check_profile_role_update() from public, anon, authenticated;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

revoke all on function public.handle_updated_at() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

-- Supabase/Postgres grants function execution to PUBLIC by default. Make future
-- functions private unless a migration explicitly grants access.
alter default privileges in schema public
  revoke execute on functions from public;
alter default privileges in schema public
  revoke execute on functions from anon, authenticated;

-- Profile access is authenticated-only. The trigger above is the final guard
-- against column-based privilege escalation.
drop policy if exists "Users can view their own profile, Admins view all" on public.profiles;
create policy "Users can view their own profile, Admins view all"
  on public.profiles for select
  to authenticated
  using (
    (select auth.uid()) = id
    or private.current_user_role() in ('owner', 'admin')
  );

drop policy if exists "Users can update their own profile details" on public.profiles;
create policy "Users can update their own profile details"
  on public.profiles for update
  to authenticated
  using (
    (select auth.uid()) = id
    or private.current_user_role() = 'owner'
  )
  with check (
    (select auth.uid()) = id
    or private.current_user_role() = 'owner'
  );

-- Orders are created only by trusted server code using the service role. The
-- public API cannot forge orders or attach arbitrary line items.
drop policy if exists "Public can create pending orders" on public.orders;
drop policy if exists "Public can insert order items" on public.order_items;

drop policy if exists "Staff can view all orders" on public.orders;
drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Authenticated users can view permitted orders"
  on public.orders for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.current_user_role() in ('owner', 'admin', 'staff')
  );

drop policy if exists "Staff can view order items" on public.order_items;
drop policy if exists "Customers can view their own order items" on public.order_items;
create policy "Authenticated users can view permitted order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders as orders
      where orders.id = order_items.order_id
        and (
          orders.user_id = (select auth.uid())
          or private.current_user_role() in ('owner', 'admin', 'staff')
        )
    )
  );

commit;
