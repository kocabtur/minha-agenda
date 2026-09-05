# Minha Agenda

Agenda pessoal semanal, em formato de PWA (Progressive Web App) instalável, feita com React + Vite.

## Funcionalidades

- Agenda semanal por dia (Dom a Sáb), com horário de início e término para cada compromisso.
- Categorias fixas: Faculdade, Acordar, Dormir, Célula, Culto, Escala voluntário — e criação de categorias personalizadas.
- Adição/edição/exclusão de horários, com seleção dos dias da semana em que cada um se repete.
- Barra "bateria" no topo mostrando quantas horas do dia (de 24h) ainda estão livres, considerando os horários com início e término marcados no dia selecionado.
- Visual com fundo bege (`#F2F1EC`), tipografia serifada Fraunces nos títulos e Public Sans no restante, com cor por categoria.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse o endereço mostrado no terminal (normalmente `http://localhost:5173`).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Instalando como app no iPhone

1. Rode `npm run build && npm run preview` (ou publique o `dist/` em um servidor HTTPS — instalação como PWA no iOS exige HTTPS, exceto em `localhost`).
2. Abra o endereço no Safari do iPhone.
3. Toque no botão de compartilhamento e depois em **Adicionar à Tela de Início**.
4. O app abrirá em tela cheia, sem a barra do navegador, com ícone próprio.

## Armazenamento dos dados

Os dados (categorias e horários) ficam sempre salvos localmente no dispositivo usando **IndexedDB** — isso faz o app abrir instantaneamente e continuar funcionando offline. Opcionalmente, configurando o **Supabase** (veja a seção abaixo), esses mesmos dados também são sincronizados na nuvem, para não se perderem e para aparecerem em qualquer aparelho onde você abrir o app.

Sem o Supabase configurado, o app funciona normalmente, só que "somente local" (indicado no topo da tela) — como antes, use o menu **Configurações (⚙) → Backup dos dados** para exportar/importar um `.json` manualmente.

## Configurando o Supabase (sincronização entre aparelhos)

### 1. Criar uma conta gratuita

1. Acesse [supabase.com](https://supabase.com) e clique em **Start your project**.
2. Crie uma conta (pode entrar com GitHub) — o plano gratuito é suficiente para este app.

### 2. Criar um projeto novo

1. No painel, clique em **New project**.
2. Escolha a organização (ou crie uma), dê um nome (ex.: `minha-agenda`), defina uma senha para o banco (guarde-a) e escolha uma região próxima (ex.: `South America (São Paulo)`, se disponível).
3. Clique em **Create new project** e aguarde 1–2 minutos até o projeto ficar pronto.

### 3. Criar as tabelas

1. No menu lateral, abra **SQL Editor** → **New query**.
2. Copie e cole o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste repositório.
3. Clique em **Run**. Isso cria as tabelas `categories` e `events`, já com a coluna `profile_id` usada para separar os dados de cada pessoa (veja "Perfis e uso por várias pessoas" abaixo).

> Se você já tinha rodado uma versão anterior deste script (sem a coluna `profile_id`) e já tem dados reais salvos, **não rode `schema.sql` de novo** — use [`supabase/enable_profiles.sql`](./supabase/enable_profiles.sql), que faz a migração preservando o que já existe.

### 4. Pegar a URL e a chave do projeto

1. No menu lateral, abra **Project Settings** (ícone de engrenagem) → **API**.
2. Copie o **Project URL** e a chave **anon public**.

### 5. Configurar as variáveis de ambiente no app

1. Na raiz do projeto, copie `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Preencha com os valores copiados no passo anterior:
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
3. Reinicie o servidor (`npm run dev`). O indicador no topo do app deve mudar de "Somente local" para "Sincronizado".

O arquivo `.env.local` não é versionado (já está no `.gitignore`) — cada instalação do app (seu computador, o build publicado, etc.) precisa das suas próprias variáveis configuradas para sincronizar com o mesmo projeto Supabase.

### Como funciona a sincronização

- Toda vez que você adiciona, edita ou exclui um horário/categoria, o app grava primeiro no IndexedDB (local, instantâneo) e em seguida envia a mesma alteração ao Supabase.
- Se não houver internet no momento, a alteração fica guardada numa fila local e é enviada automaticamente assim que a conexão voltar (ou na próxima vez que o app for aberto).
- Ao abrir o app, ele mostra imediatamente os dados já salvos localmente e, em paralelo, busca a versão mais recente do Supabase para manter os aparelhos sincronizados.
- Na primeiríssima conexão com um projeto Supabase novo (banco ainda vazio), o app faz o caminho inverso: envia os dados que já existiam localmente para o Supabase, em vez de apagá-los.

**Limitação conhecida:** se dois aparelhos tiverem dados locais diferentes e **nenhum dos dois** já tiver sincronizado antes, o primeiro a sincronizar "vence" (seus dados vão para o Supabase); o segundo aparelho, ao sincronizar, substitui seu cache local pelo do Supabase. Para evitar isso, configure o Supabase primeiro em um único aparelho (o que já tem os dados que você quer manter) e só depois configure os demais.

## Perfis e uso por várias pessoas

Com o Supabase configurado, o app pede um nome (o "perfil") antes de mostrar a agenda. Isso existe para permitir que **várias pessoas usem o mesmo app/link publicado, cada uma com sua própria agenda** — os horários de cada nome ficam separados dos de outros nomes, mesmo todo mundo acessando a mesma URL e o mesmo projeto Supabase.

**Isso não é um login de verdade — é importante entender a diferença:**

- Não existe senha nem confirmação de identidade. Quem digitar (ou adivinhar) o nome de outra pessoa acessa os horários dela e pode editá-los ou excluí-los.
- A separação é feita pelo próprio app (ele só busca/grava os dados daquele nome) — alguém com acesso direto à API do Supabase (fora do app) poderia ler ou editar os dados de qualquer perfil, mesmo sem saber o nome certo.
- Para uma agenda pessoal compartilhada casualmente entre amigos que confiam uns nos outros, isso costuma ser suficiente. Se no futuro você quiser privacidade garantida de verdade (com senha, impossível de adivinhar ou acessar por fora do app), é possível adicionar autenticação real (Supabase Auth) depois — é uma mudança maior, avise se quiser fazer isso.

**Para compartilhar com amigos:** basta mandar o link publicado. Cada pessoa escolhe um nome na tela inicial (combine com elas nomes que só vocês conheçam, se quiser uma separação melhor) e, a partir daí, tem sua própria agenda — incluindo as categorias fixas, criadas automaticamente na primeira vez que aquele nome é usado.

Para trocar de perfil no mesmo aparelho (ex.: para testar com outro nome, ou emprestar o celular para alguém usar o próprio perfil), use **Configurações (⚙) → Perfil → Trocar de perfil**. Isso limpa o cache local do aparelho, para a próxima pessoa não ver os dados do perfil anterior.

## Estrutura do projeto

```
src/
  components/    Componentes de UI (barra de horas, abas de dias, formulário, lista de horários, tela de perfil, etc.)
  hooks/         useSchedule (estado/persistência da agenda) e useProfile (nome do perfil ativo, salvo no aparelho)
  utils/         Funções auxiliares de cálculo de horário/duração
  constants.js   Categorias fixas, dias da semana, paleta de cores
  db.js          Camada de acesso ao IndexedDB (via idb): cache local, backup/restore e fila de sincronização
  supabase.js    Cliente do Supabase (fica desativado se as variáveis de ambiente não estiverem definidas)
  sync.js        Lógica de sincronização entre o IndexedDB e o Supabase
supabase/
  schema.sql           Script para criar as tabelas categories/events (projeto novo, já com profile_id)
  enable_profiles.sql  Migração para quem já tinha as tabelas sem a coluna profile_id
```
