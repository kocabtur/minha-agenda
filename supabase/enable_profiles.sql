-- Migração para quem já rodou o schema.sql original (sem profile_id) e já
-- tem dados reais nas tabelas categories/events. Rode os passos na ordem.

-- Passo 1: adiciona a coluna profile_id, ainda sem exigir valor (para não
-- quebrar as linhas que já existem).
alter table categories add column if not exists profile_id text;
alter table events add column if not exists profile_id text;

-- Passo 2: associa os dados que já existiam a um nome de perfil (escolha o
-- nome que você vai usar no app — o mesmo que vai digitar na tela de login).
-- Substitua 'seu-nome' abaixo pelo nome escolhido antes de rodar.
update categories set profile_id = 'seu-nome' where profile_id is null;
update events set profile_id = 'seu-nome' where profile_id is null;

-- Passo 3: agora que toda linha tem um dono, torna a coluna obrigatória.
alter table categories alter column profile_id set not null;
alter table events alter column profile_id set not null;

create index if not exists categories_profile_id_idx on categories(profile_id);
create index if not exists events_profile_id_idx on events(profile_id);

-- Passo 4 (opcional, mas recomendado): os IDs das categorias fixas eram
-- compartilhados (ex.: "faculdade") e agora, com vários perfis possíveis no
-- mesmo banco, precisam ser únicos por perfil para não colidir com o de
-- outra pessoa. O app já cria as categorias fixas com um novo ID (prefixado
-- com o nome do perfil) na primeira vez que alguém usa aquele nome. Para não
-- ficar com as categorias fixas antigas com ID genérico, renomeie os IDs
-- delas para o novo formato (substitua 'seu-nome' de novo, igual no passo 2):
update events
set category_id = 'seu-nome' || '-' || category_id
where profile_id = 'seu-nome'
  and category_id in ('faculdade', 'acordar', 'dormir', 'celula', 'culto', 'escala-voluntario');

update categories
set id = 'seu-nome' || '-' || id
where profile_id = 'seu-nome'
  and id in ('faculdade', 'acordar', 'dormir', 'celula', 'culto', 'escala-voluntario');
