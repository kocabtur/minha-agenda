-- Execute este script no SQL Editor do seu projeto Supabase (Database > SQL Editor > New query).
-- Cria as tabelas usadas pelo app "Minha Agenda" para guardar categorias e horários.

create table if not exists categories (
  id text primary key,
  name text not null,
  color text not null,
  is_fixed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  title text not null,
  category_id text not null,
  start_time text not null,
  end_time text not null,
  days integer[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Habilita Row Level Security (obrigatório no Supabase para liberar acesso via chave anônima).
alter table categories enable row level security;
alter table events enable row level security;

-- IMPORTANTE: este app não usa login/autenticação (é de uso pessoal, single-user).
-- As políticas abaixo liberam leitura e escrita para qualquer requisição que use a
-- chave "anon" do projeto. Isso é suficiente para o app funcionar, mas significa que
-- qualquer pessoa que descobrir a URL + chave anônima do seu projeto pode ler/editar
-- esses dados. Para um uso puramente pessoal isso costuma ser um risco aceitável,
-- mas não reaproveite essas tabelas/policies para dados sensíveis sem adicionar
-- autenticação (Supabase Auth) e trocar estas políticas por regras baseadas em
-- auth.uid().
drop policy if exists "categories_allow_all" on categories;
create policy "categories_allow_all" on categories for all using (true) with check (true);

drop policy if exists "events_allow_all" on events;
create policy "events_allow_all" on events for all using (true) with check (true);
