# Top 20 - Sistema de Votação

Sistema completo de votação de músicas para aulas Top 20 com:

- Frontend em React (Vite)
- Backend em Node.js + Express
- MongoDB
- Autenticação JWT para módulo admin
- Módulo público de votação por link/slug

## Estrutura

- `backend`: API REST + autenticação + regras de votação
- `frontend`: painel admin + página pública de voto

## Backend

1. Copie `backend/.env.example` para `backend/.env`
2. Configure as variáveis
3. Instale dependências e rode:

```bash
cd backend
npm install
npm run dev
```

Crie a primeira conta pelo frontend em **Cadastrar** (`/admin/login`) ou via `POST /register`.

### Endpoints

- `POST /register`
- `POST /login`
- `GET /polls`
- `POST /polls`
- `GET /polls/:id` (id ou slug)
- `PUT /polls/:id`
- `DELETE /polls/:id`
- `POST /vote`
- `GET /results/:pollId`

## Frontend

1. Copie `frontend/.env.example` para `frontend/.env`
2. Instale e rode:

```bash
cd frontend
npm install
npm run dev
```

## Fluxo

- Admin cria conta ou faz login em `/admin/login`
- Admin cria votação com músicas do YouTube (thumbnail e embed automáticos)
- Sistema gera slug público em `/votacao/:slug`
- Usuário informa nome, email e instagram
- Cada email vota uma vez por votação
- Resultado final ordenado por `likes - dislikes`
