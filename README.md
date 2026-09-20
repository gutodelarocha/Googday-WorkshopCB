# Gooday

App social (React + Vite + Tailwind + Supabase).

## Setup

```bash
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
pnpm install
pnpm dev
```

Demo login: `email@email.com` / `teste123`

## Deploy

- Frontend: Vercel (`vercel.json` → Vite → `dist`)
- Backend: Supabase (Postgres RPCs + RLS). **Não precisa de Edge Functions** para o fluxo principal.
