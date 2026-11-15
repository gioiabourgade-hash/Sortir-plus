-- SORTIR+ V15.5 — À exécuter UNE FOIS dans SQL Editor (projet existant).
-- Conserve les comptes, rôles administrateurs et annonces déjà enregistrés.
-- À utiliser après le SQL V15 déjà installé.

alter table public.listings add column if not exists photo_url text;

-- Le rôle partenaire est attribué automatiquement à chaque NOUVEL inscrit.
-- Ne modifie pas le rôle des comptes existants, notamment l'administrateur.
create or replace function public.sortir_register_partner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, role) values (new.id, 'partner')
  on conflict (id) do update set role='partner'
  where public.profiles.role = 'user';
  return new;
end;
$$;
drop trigger if exists sortir_partner_on_signup on auth.users;
create trigger sortir_partner_on_signup after insert on auth.users
for each row execute function public.sortir_register_partner();

-- Le propriétaire peut lire son propre profil, sans accéder aux autres profils.
alter table public.profiles enable row level security;
drop policy if exists "SORTIR read own profile" on public.profiles;
create policy "SORTIR read own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()));
grant select on public.profiles to authenticated;

-- Photos : accès public en lecture, ajout limité au dossier de l'utilisateur connecté.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos','listing-photos',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=3145728,
allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "SORTIR public listing photos" on storage.objects;
create policy "SORTIR public listing photos" on storage.objects
for select to public using (bucket_id='listing-photos');
drop policy if exists "SORTIR partner photo upload" on storage.objects;
create policy "SORTIR partner photo upload" on storage.objects
for insert to authenticated with check (
 bucket_id='listing-photos' and (storage.foldername(name))[1]=(select auth.uid())::text
 and (select public.my_sortir_role()) in ('admin','partner')
);
