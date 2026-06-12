# FutRank

MVP PWA para organizar peladas, cadastrar jogadores, controlar presenca, coletar avaliacoes e gerar times equilibrados.

## Stack

- React + Vite
- JavaScript
- Tailwind CSS
- Zustand
- Supabase
- localStorage como cache/fallback
- PWA basico com manifest e service worker

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:5173/futrank/`.

Para conectar ao Supabase em desenvolvimento, copie `.env.example` para `.env.local` e preencha:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable-publica
VITE_FUTRANK_STATE_ID=default
```

O deploy usa `.env.production`, que contem apenas a URL publica do projeto e a publishable key do Supabase. Nao coloque a senha do banco nem secret keys em arquivos versionados.

## Scripts

```bash
npm run build
npm run lint
```

## Estrutura

- `src/components`: componentes reutilizaveis
- `src/pages`: telas do MVP
- `src/store`: store Zustand persistida
- `src/utils`: regras de overall, avaliacoes, balanceamento e WhatsApp
- `src/hooks`: hooks auxiliares

## Persistencia

O app usa `localStorage` na chave `futrank-storage-v1` como cache local. Quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` estao configuradas, o estado tambem e sincronizado com a tabela `public.futrank_state` no Supabase.

Para criar a tabela no Supabase:

1. Crie um projeto no Supabase.
2. Abra `SQL Editor`.
3. Execute o arquivo `supabase/migrations/20260609_create_futrank_state.sql`.
4. Copie `Project URL` e `Publishable key` em `Project Settings` > `API Keys`.

O modelo atual grava um snapshot JSON unico do estado do MVP. Isso facilita a migracao inicial do `localStorage`; quando o produto crescer, da para normalizar em tabelas como `players`, `evaluations` e `teams`.

As policies da migration permitem leitura e escrita pelo app publico usando a chave anonima. Isso e suficiente para MVP privado/baixo risco, mas antes de abrir para uso publico sensivel vale adicionar Supabase Auth, PIN de administracao ou uma Edge Function para proteger escrita.

## Deploy no GitHub Pages

O projeto esta configurado para publicar em `https://cedvasques.github.io/futrank/` usando GitHub Actions.

No GitHub, habilite:

1. `Settings` > `Pages`
2. Em `Build and deployment`, selecione `Source: GitHub Actions`
3. Volte para `Actions` e acompanhe o workflow `Deploy to GitHub Pages`

Para publicar com Supabase, mantenha `.env.production` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_FUTRANK_STATE_ID`. Esses valores sao publicos no bundle do frontend; nao use a senha do banco nem secret keys no Vite.

Se o repositorio estiver privado, o GitHub Pages depende do plano da conta. No GitHub Free, use repositorio publico para publicar pelo Pages.
