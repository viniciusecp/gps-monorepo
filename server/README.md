# gps-api

Sistema de rastreamento veicular onde veículos com rastreadores enviam suas coordenadas para este API, que as armazena em banco MySQL e as disponibiliza para quem faz chamadas à API.

Esta API foi criada para servir o aplicativo **RastroApp**.

## Tecnologias

- **Runtime**: Node.js
- **Framework**: Fastify 5.x
- **ORM**: Drizzle ORM + MySQL (mysql2)
- **Linguagem**: TypeScript
- **Autenticação**: JWT (@fastify/jwt)
- **Validação**: Zod
- **Gerenciador de pacotes**: pnpm

## Scripts

```bash
pnpm dev          # Inicia em modo desenvolvimento (tsx watch)
pnpm build        # Compila TypeScript para dist/
pnpm start        # Executa versão compilada
pnpm db:generate  # Gera migrations (drizzle-kit)
pnpm db:push      # Aplica alterações do schema no banco
```

## Rotas da API

Todas as rotas têm prefixo `/api`:

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| POST | `/login` | Não | Login com email/apelido + senha, retorna tokens JWT |
| POST | `/refresh` | Não | Renova access token via refresh token |
| GET | `/gprmc/coordinates/:imei` | Sim | Últimas 10 coordenadas GPS de um veículo |

## Estrutura do Projeto

```
src/
  index.ts              # Entrada: cria app, escuta na porta 3000
  app.ts                # Configuração do Fastify: JWT, rotas, decorator authenticate
  db/
    connection.ts       # Conexão MySQL via Drizzle ORM
    schema.ts           # Tabelas: cliente, bem, gprmc
  routes/               # Definição das rotas
  controllers/          # Lógica das rotas
  services/             # Lógica de negócio e acesso ao banco
  utils/                # Utilitários (conversão de coordenadas)
  validators/           # Schemas Zod para validação
  middleware/           # Middleware de autenticação JWT
```

## Banco de Dados

- **Banco**: MySQL (`tracker`, user: `root`, password: `root`, host: `localhost`)
- **Tabelas**:
  - `cliente`: usuários (email, senha MD5, master, admin, id_admin)
  - `bem`: veículos (imei, nome, cliente FK, status)
  - `gprmc`: coordenadas GPS (imei, lat/lng, speed, date)

Configuração do Drizzle em `drizzle.config.ts`. Use variáveis de ambiente: `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_NAME`.
