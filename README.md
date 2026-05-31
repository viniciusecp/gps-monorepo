# GPS Monorepo

Sistema de rastreamento veicular — monorepo com dois pacotes gerenciados via **pnpm workspace**:

| Pacote | Descrição |
|---|---|
| [`server/`](./server/) | API REST (Fastify + Drizzle ORM + MySQL + TypeScript) |
| [`app/`](./app/) | App mobile (Expo SDK 54 + React Native 0.81 + TypeScript) |

Veículos com rastreadores GPS enviam coordenadas para a API, que as armazena em MySQL e as disponibiliza para o aplicativo em tempo real.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (20+)
- [pnpm](https://pnpm.io/installation)
- [MySQL](https://dev.mysql.com/downloads/) (ou MariaDB)

## Estrutura

```
gps-monorepo/
  server/           # API backend
    src/
      controllers/  # Handlers das rotas
      services/     # Lógica de negócio (chat, geocode, GPS, auth, BEM)
      repositories/ # Acesso a dados
      routes/       # Definição das rotas
      db/           # Conexão + schema Drizzle
      middleware/   # Auth, error handler, validação
      validators/   # Schemas Zod
      utils/        # Utilitários (coordenadas, logger)

  app/              # App mobile
    app/            # Páginas (Expo Router file-based)
    components/     # Componentes reutilizáveis
    src/
      services/     # API client
      theme/        # Tema escuro
      context/      # Contextos React
```

## Como Começar

```bash
# 1. Instalar dependências de cada pacote
cd server && pnpm install
cd ../app && pnpm install

# 2. Configurar variáveis de ambiente
# Copie .env.example para .env em cada pacote e preencha

# 3. Iniciar o servidor
cd server && pnpm dev

# 4. Em outro terminal, iniciar o app
cd app && pnpm start
```

## Scripts

### server/

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor com hot-reload (tsx watch) |
| `pnpm build` | Compilar TypeScript para `dist/` |
| `pnpm start` | Executar versão compilada |
| `pnpm db:generate` | Gerar migrations Drizzle |
| `pnpm db:push` | Sincronizar schema com o banco |
| `pnpm lint` | Linter (Biome) |
| `pnpm lint:fix` | Linter + auto-fix |

### app/

| Comando | Descrição |
|---|---|
| `pnpm start` | Servidor de desenvolvimento Expo |
| `pnpm android` | Executar no Android |
| `pnpm ios` | Executar no iOS (macOS) |
| `pnpm web` | Executar no navegador |
| `pnpm lint` | Linter (ESLint) |
| `pnpm build:android` | Build EAS Android APK |

## Tecnologias

### Server

- **Fastify 5.x** — Framework HTTP
- **Drizzle ORM** — ORM para MySQL
- **JWT** — Autenticação via @fastify/jwt (access + refresh tokens)
- **Zod** — Validação de schemas
- **OpenRouter** — Chat com IA (SSE streaming)
- **Nominatim** — Reverse geocoding

### App

- **Expo SDK 54** — Framework mobile
- **React Native 0.81** — UI nativa
- **Expo Router 6** — Roteamento file-based
- **react-native-maps** — Mapas com Google Maps
- **AsyncStorage** — Persistência local
- **react-native-reanimated** — Animações
