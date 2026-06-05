# FutRank

MVP PWA para organizar peladas, cadastrar jogadores, controlar presenca, coletar avaliacoes e gerar times equilibrados.

## Stack

- React + Vite
- JavaScript
- Tailwind CSS
- Zustand
- localStorage
- PWA basico com manifest e service worker

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:5173/`.

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

Os dados ficam em `localStorage` na chave `futrank-storage-v1`. O app nao reseta jogadores automaticamente.

## Deploy no GitHub Pages

O projeto esta configurado para publicar em `https://cedvasques.github.io/futrank/` usando GitHub Actions.

No GitHub, habilite:

1. `Settings` > `Pages`
2. Em `Build and deployment`, selecione `Source: GitHub Actions`
3. Volte para `Actions` e acompanhe o workflow `Deploy to GitHub Pages`

Se o repositorio estiver privado, o GitHub Pages depende do plano da conta. No GitHub Free, use repositorio publico para publicar pelo Pages.
