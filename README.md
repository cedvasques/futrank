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
