-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Areas / dependencies
create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Technicians catalog
create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  email text,
  created_at timestamptz not null default now()
);

-- Incidents master table
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_name text not null,
  area_id uuid not null references public.areas(id) on delete restrict,
  description text not null,
  notes text,
  technician_id uuid references public.technicians(id) on delete set null,
  resolution_notes text,
  confirmed_by text,
  confirmed_at timestamptz,
  status text not null check (status in ('Pendiente', 'En proceso', 'Resuelto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists incidents_status_idx on public.incidents(status);
create index if not exists incidents_area_idx on public.incidents(area_id);
create index if not exists incidents_created_at_idx on public.incidents(created_at);

create table if not exists public.system_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  role text not null check (role in ('Administrador', 'Operador')),
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo')),
  created_at timestamptz not null default now()
);

-- Row Level Security policies
alter table public.areas enable row level security;
alter table public.technicians enable row level security;
alter table public.incidents enable row level security;
alter table public.system_users enable row level security;

alter table public.incidents
  add column if not exists resolution_notes text,
  add column if not exists confirmed_by text,
  add column if not exists confirmed_at timestamptz;

create policy "Allow authenticated read areas"
on public.areas
for select
using (auth.role() in ('authenticated', 'service_role'));

create policy "Allow service role manage areas"
on public.areas
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Allow authenticated read technicians"
on public.technicians
for select
using (auth.role() in ('authenticated', 'service_role'));

create policy "Allow service role manage technicians"
on public.technicians
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Allow authenticated read incidents"
on public.incidents
for select
using (auth.role() in ('authenticated', 'service_role'));

create policy "Allow authenticated write incidents"
on public.incidents
for insert
with check (auth.role() in ('authenticated', 'service_role'));

create policy "Allow authenticated update incidents"
on public.incidents
for update
using (auth.role() in ('authenticated', 'service_role'))
with check (auth.role() in ('authenticated', 'service_role'));

create policy "Allow service role delete incidents"
on public.incidents
for delete
using (auth.role() = 'service_role');

create policy "Allow service role manage system users"
on public.system_users
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create or replace function public.set_incident_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_incidents_updated_at on public.incidents;
create trigger trg_incidents_updated_at
before update on public.incidents
for each row
execute procedure public.set_incident_updated_at();

create sequence if not exists public.incident_code_seq;

create or replace function public.incident_code_sequence()
returns text
language plpgsql
as $$
declare
  next_value bigint;
  current_year text := to_char(now(), 'YYYY');
begin
  select nextval('public.incident_code_seq') into next_value;
  return format('INC-%s-%s', current_year, lpad(next_value::text, 3, '0'));
end;
$$;

create or replace view public.dashboard_summary as
select
  status,
  count(*)::integer as total
from public.incidents
group by status;

-- Seed data
insert into public.areas (name)
values ('Tecnologia de la Informacion'), ('Logistica'), ('Recursos Humanos'), ('Tesoreria')
on conflict (name) do nothing;

insert into public.technicians (full_name, email)
values
  ('Luis Rojas', 'luis.rojas@example.com'),
  ('Maria Aguilar', 'maria.aguilar@example.com'),
  ('Carlos Ramos', 'carlos.ramos@example.com')
on conflict (full_name) do nothing;

insert into public.system_users (username, role, status)
values
  ('admin', 'Administrador', 'Activo'),
  ('operador1', 'Operador', 'Activo')
on conflict (username) do nothing;

-- Example incidents
insert into public.incidents (code, user_name, area_id, description, technician_id, status, notes)
select
  public.incident_code_sequence(),
  concat('Usuario ', row_number() over (order by name)),
  id,
  'Incidencia de ejemplo registrada para poblar el dashboard.',
  (select id from public.technicians order by created_at limit 1),
  'Pendiente',
  'Sin observaciones.'
from public.areas
where not exists (select 1 from public.incidents);
