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

Os dados (categorias e horários) ficam salvos localmente no dispositivo usando **IndexedDB**, que é bem mais robusto e persistente do que `localStorage`. No primeiro carregamento o app também solicita ao navegador armazenamento persistente (`navigator.storage.persist()`), reduzindo o risco de os dados serem apagados automaticamente pelo sistema por falta de uso.

Como este projeto não tem um backend/servidor próprio, os dados continuam vivendo no dispositivo (não em nuvem). Para ter uma cópia de segurança portátil, use o menu **Configurações (⚙) → Backup dos dados** para exportar um arquivo `.json` (e importá-lo de volta quando quiser, inclusive em outro aparelho/instalação).

## Funcionamento offline

O app é configurado com `vite-plugin-pwa`, que gera um service worker (Workbox) e faz o pré-cache de todos os arquivos estáticos (HTML, CSS, JS e fontes). Depois do primeiro carregamento, o app funciona totalmente offline — os dados continuam disponíveis via IndexedDB independentemente de conexão com a internet.

## Estrutura do projeto

```
src/
  components/    Componentes de UI (barra de horas, abas de dias, formulário, lista de horários, etc.)
  hooks/         Hook useSchedule com toda a lógica de estado e persistência
  utils/         Funções auxiliares de cálculo de horário/duração
  constants.js   Categorias fixas, dias da semana, paleta de cores
  db.js          Camada de acesso ao IndexedDB (via idb) e backup/restore
```
