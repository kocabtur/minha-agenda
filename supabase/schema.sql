-- Execute este script no SQL Editor do seu projeto Supabase (Database > SQL Editor > New query).
-- Cria as tabelas usadas pelo app "Minha Agenda" para guardar categorias e horários,
-- separados por "perfil" (o nome que cada pessoa digita ao abrir o app).
--
-- Se você já tinha rodado uma versão anterior deste script (sem a coluna
-- profile_id) e já tem dados reais, use supabase/enable_profiles.sql em vez
-- deste, para migrar o banco existente sem perder nada.

create table if not exists categories (
  id text primary key,
  name text not null,
  color text not null,
  is_fixed boolean not null default false,
  profile_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  title text not null,
  category_id text not null,
  start_time text not null,
  end_time text not null,
  days integer[] not null default '{}',
  profile_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists categories_profile_id_idx on categories(profile_id);
create index if not exists events_profile_id_idx on events(profile_id);

-- Habilita Row Level Security (obrigatório no Supabase para liberar acesso via chave anônima).
alter table categories enable row level security;
alter table events enable row level security;

-- IMPORTANTE: este app não usa senha nem verificação real de identidade — cada
-- pessoa só digita um nome (profile_id), sem confirmação nenhuma. A separação
-- entre perfis é feita pelo próprio app (ele só consulta e grava filtrando
-- por esse nome), não pelo banco. Estas políticas liberam leitura/escrita
-- para qualquer requisição que use a chave "anon" do projeto — ou seja,
-- alguém com acesso direto à API (fora do app) poderia ler/editar qualquer
-- profile_id. Para privacidade de verdade (garantida pelo servidor, não só
-- por convenção), seria necessário adicionar autenticação real (Supabase
-- Auth) e políticas baseadas em auth.uid().
drop policy if exists "categories_allow_all" on categories;
create policy "categories_allow_all" on categories for all using (true) with check (true);

drop policy if exists "events_allow_all" on events;
create policy "events_allow_all" on events for all using (true) with check (true);
