-- SORTIR+ V15 : à exécuter dans Supabase SQL Editor, APRÈS la table profiles V14.
-- Aucun mot de passe ni clé secrète dans ce script.
create table if not exists public.listings (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('event','restaurant','activity')),
 status text not null default 'pending' check (status in ('pending','published','rejected')),
 title text not null check (length(trim(title)) between 1 and 140),
 category text not null default 'Autre',
 description text not null default '',
 place text not null default '',
 address text not null default '',
 starts_on date,
 ends_on date,
 hours text not null default '',
 price text not null default '',
 booking text not null default '',
 booking_url text not null default '',
 transport text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint dates_order check (ends_on is null or starts_on is null or ends_on >= starts_on),
 constraint event_dates check (kind <> 'event' or (starts_on is not null and ends_on is not null))
);
create index if not exists listings_status_kind_idx on public.listings(status,kind);
create index if not exists listings_owner_idx on public.listings(owner_id);
alter table public.listings enable row level security;
-- SECURITY DEFINER avoids recursive profile RLS lookups. No user-controlled role changes.
create or replace function public.my_sortir_role() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = (select auth.uid()) limit 1 $$;
revoke all on function public.my_sortir_role() from public;
grant execute on function public.my_sortir_role() to authenticated;
-- Safe reruns of policies.
drop policy if exists "Published listings are public" on public.listings;
create policy "Published listings are public" on public.listings for select to anon, authenticated using (status='published');
drop policy if exists "Owners and admins read drafts" on public.listings;
create policy "Owners and admins read drafts" on public.listings for select to authenticated using (owner_id=(select auth.uid()) or (select public.my_sortir_role())='admin');
drop policy if exists "Owners create drafts" on public.listings;
create policy "Owners create drafts" on public.listings for insert to authenticated with check (
 owner_id=(select auth.uid()) and (select public.my_sortir_role()) in ('admin','partner')
 and (status='pending' or (select public.my_sortir_role())='admin')
);
drop policy if exists "Owners edit drafts admins edit all" on public.listings;
create policy "Owners edit drafts admins edit all" on public.listings for update to authenticated
 using ((select public.my_sortir_role())='admin' or (owner_id=(select auth.uid()) and status='pending' and (select public.my_sortir_role())='partner'))
 with check ((select public.my_sortir_role())='admin' or (owner_id=(select auth.uid()) and status='pending' and (select public.my_sortir_role())='partner'));
drop policy if exists "Owners delete drafts admins delete all" on public.listings;
create policy "Owners delete drafts admins delete all" on public.listings for delete to authenticated
 using ((select public.my_sortir_role())='admin' or (owner_id=(select auth.uid()) and status='pending' and (select public.my_sortir_role())='partner'));
-- Role changes are intentionally NOT permitted through browser API.
-- Keep the existing profiles SELECT policy. Grant minimal table privileges to API roles.
grant select on public.listings to anon;
grant select,insert,update,delete on public.listings to authenticated;
grant select on public.profiles to authenticated;
