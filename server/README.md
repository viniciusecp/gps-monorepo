# gps-api

Sistema de rastreamento veicular onde veículos com rastreadores enviam suas coordenadas GPS para esta API, que as armazena em banco MySQL e as disponibiliza para consumidores.

Esta API foi criada para servir o aplicativo **RastroApp**.

## Tecnologias

- **Runtime**: Node.js
- **Framework**: Fastify 5.x
- **ORM**: Drizzle ORM + MySQL (mysql2)
- **Linguagem**: TypeScript
- **Autenticação**: JWT (@fastify/jwt) — access token 15min, refresh token 365d
- **Validação**: Zod
- **Logging**: Pino
- **AI Chat**: OpenRouter (SSE streaming)
- **Geocoding**: Nominatim (OpenStreetMap)
- **Gerenciador de pacotes**: pnpm

## Scripts

```bash
pnpm dev          # Inicia em modo desenvolvimento (tsx watch via nodemon)
pnpm build        # Compila TypeScript para dist/
pnpm start        # Executa versão compilada (node dist/index.js)
pnpm db:generate  # Gera migrations (drizzle-kit generate)
pnpm db:push      # Aplica alterações do schema no banco (drizzle-kit push)
pnpm lint         # Linter (Biome)
pnpm lint:fix     # Linter + auto-fix + organizar imports (Biome)
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_NAME` | `tracker` | Nome do banco MySQL |
| `DB_USER` | `root` | Usuário MySQL |
| `DB_PASS` | `root` | Senha MySQL |
| `DB_HOST` | `localhost` | Host MySQL |
| `JWT_SECRET` | `supersecretjwtkeychangemeinprod` | Chave secreta para assinar JWTs |
| `OPENROUTER_API_KEY` | — | API Key do OpenRouter para chat AI |
| `OPENROUTER_MODEL` | `openrouter/free` | Modelo OpenRouter |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | URL base da API OpenRouter |
| `NOMINATIM_BASE_URL` | `https://nominatim.openstreetmap.org` | URL base do Nominatim |
| `PORT` | `3333` | Porta do servidor |

## Rotas da API

Todas as rotas têm prefixo `/api`:

### Autenticação

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| POST | `/api/cliente/login` | Não | Login com email ou apelido + senha (MD5), retorna `{ user, token, refreshToken }` |
| POST | `/api/cliente/refresh` | Não | Renova access token via refresh token, retorna `{ token }` |

### GPS / Coordenadas

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| GET | `/api/gprmc/coordinates/:imei` | JWT | Últimas 10 coordenadas GPS de um veículo |
| GET | `/api/gprmc/history/:imei` | JWT | Histórico de coordenadas em um intervalo de datas (`startDate`, `endDate` no query) |

### Veículos

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| GET | `/api/bem/vehicles` | JWT | Lista todos os veículos do usuário autenticado |

### Chat (AI)

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| POST | `/api/chat` | JWT | Chat com IA via OpenRouter — retorna resposta em **SSE** (Server-Sent Events) |

### Geocoding

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| GET | `/api/geocode/reverse` | Não | Reverse geocode — converte `lat`/`lon` em endereço via Nominatim |

## Estrutura do Projeto

```
src/
  index.ts              # Entrada: carrega dotenv, cria app, escuta na porta
  app.ts                # Configuração do Fastify: JWT, serviços, rotas, error handler

  controllers/          # Handlers das rotas (delegam para services)
  services/             # Lógica de negócio
    chat/               #   Chat AI (chat-service, openrouter-service, session-store, tools)
    geocode/            #   Geocoding (nominatim-service)
  repositories/         # Acesso a dados (SQL via Drizzle)
  db/                   # Conexão MySQL + schema Drizzle + retry
    connection.ts
    schema.ts           # Tabelas: cliente, bem, gprmc
    retry.ts
  routes/               # Definição das rotas
  middleware/           # Auth, error handler, validação
  validators/           # Schemas Zod
  errors/               # AppError customizado
  utils/                # Conversão de coordenadas GPRS → decimal, logger
```

## Banco de Dados

- **Banco**: MySQL
- **Tabelas**:
  - `cliente` — usuários (email, senha MD5, master, admin, id_admin)
  - `bem` — veículos (imei, nome, cliente FK, status)
  - `gprmc` — coordenadas GPS (imei, lat/lng, speed, date)

Configuração do Drizzle em `drizzle.config.ts`. Use variáveis de ambiente para conexão.
