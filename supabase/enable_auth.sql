-- Migração para quem já tinha rodado o schema.sql ANTIGO (sem login) e já tem
-- dados reais nas tabelas categories/events. Rode os passos NA ORDEM abaixo.
--
-- Passo 0 (fora do SQL Editor): antes de rodar qualquer coisa aqui, crie a sua
-- própria conta no app (abra o app publicado, digite seu e-mail na tela de
-- login e clique no link que chegar no seu e-mail). Isso cria seu usuário em
-- auth.users.

-- Passo 1: adiciona a coluna user_id, ainda sem exigir valor (para não
-- quebrar as linhas que já existem).
alter table categories add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table events add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Passo 2: descubra o seu UID. No painel do Supabase, vá em
-- Authentication > Users, clique no seu e-mail e copie o "User UID"
-- (um valor como "3fa85f64-5717-4562-b3fc-2c963f66afa6").

-- Passo 3: substitua 'COLE-SEU-UID-AQUI' abaixo pelo UID copiado e rode este
-- bloco para associar os dados que já existiam a você.
update categories set user_id = 'COLE-SEU-UID-AQUI' where user_id is null;
update events set user_id = 'COLE-SEU-UID-AQUI' where user_id is null;

-- Passo 4: agora que toda linha tem um dono, torna a coluna obrigatória.
alter table categories alter column user_id set not null;
alter table events alter column user_id set not null;

create index if not exists categories_user_id_idx on categories(user_id);
create index if not exists events_user_id_idx on events(user_id);

-- Passo 5: troca a política "libera tudo para qualquer um" por políticas que
-- restringem cada linha ao seu dono.
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

-- Passo 6 (opcional, mas recomendado): os IDs das categorias fixas eram
-- compartilhados (ex.: "faculdade") e agora cada usuário precisa dos seus
-- próprios, para não colidir com o de outras pessoas. O app já cria as
-- categorias fixas com um novo ID (prefixado com o seu UID) na primeira vez
-- que cada pessoa loga. Para não ficar com as categorias fixas antigas
-- duplicadas/com ID genérico, renomeie os IDs delas para o novo formato
-- (substitua o UID igual fez acima). A lista de IDs abaixo é a mesma de
-- src/constants.js (FIXED_CATEGORIES) — ajuste se você já tiver editado essa
-- lista no código.
update events
set category_id = 'COLE-SEU-UID-AQUI' || '-' || category_id
where user_id = 'COLE-SEU-UID-AQUI'
  and category_id in ('faculdade', 'acordar', 'dormir', 'celula', 'culto', 'escala-voluntario');

update categories
set id = 'COLE-SEU-UID-AQUI' || '-' || id
where user_id = 'COLE-SEU-UID-AQUI'
  and id in ('faculdade', 'acordar', 'dormir', 'celula', 'culto', 'escala-voluntario');
