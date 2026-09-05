-- Execute este script no SQL Editor do seu projeto Supabase (Database > SQL Editor > New query).
-- Cria as tabelas usadas pelo app "Minha Agenda" para guardar categorias e horários,
-- já com suporte a múltiplos usuários (cada um só vê/edita os próprios dados).
--
-- Se você já tinha rodado uma versão anterior deste script (sem login), use
-- supabase/enable_auth.sql em vez deste para migrar o banco existente.

create table if not exists categories (
  id text primary key,
  name text not null,
  color text not null,
  is_fixed boolean not null default false,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  title text not null,
  category_id text not null,
  start_time text not null,
  end_time text not null,
  days integer[] not null default '{}',
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on categories(user_id);
create index if not exists events_user_id_idx on events(user_id);

-- Habilita Row Level Security e restringe cada linha ao seu próprio dono
-- (auth.uid() = o usuário autenticado que fez a requisição). Isso é o que
-- garante que cada pessoa só veja e edite a própria agenda, mesmo todo
-- mundo usando o mesmo app e o mesmo projeto Supabase.
alter table categories enable row level security;
alter table events enable row level security;

drop policy if exists "categories_allow_all" on categories;
drop policy if exists "categories_select_own" on categories;
drop policy if exists "categories_insert_own" on categories;
drop policy if exists "categories_update_own" on categories;
drop policy if exists "categories_delete_own" on categories;
create policy "categories_select_own" on categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on categories for delete using (auth.uid() = user_id);

drop policy if exists "events_allow_all" on events;
drop policy if exists "events_select_own" on events;
drop policy if exists "events_insert_own" on events;
drop policy if exists "events_update_own" on events;
drop policy if exists "events_delete_own" on events;
create policy "events_select_own" on events for select using (auth.uid() = user_id);
create policy "events_insert_own" on events for insert with check (auth.uid() = user_id);
create policy "events_update_own" on events for update using (auth.uid() = user_id);
create policy "events_delete_own" on events for delete using (auth.uid() = user_id);
