## Work Item: server-chat-session

### Approach
Create an in-memory session store for chat conversations using `Map<string, Session>`. Each session is keyed by `userId` (string) and holds message history. Implement TTL-based expiry with periodic cleanup. Follow existing service patterns (plain class, decorated on Fastify instance).

### Files to Create
- `server/src/services/chat/session-store.ts` — ChatSessionStore class with types

### Files to Modify
- `server/src/app.ts` — Add `chatSessionStore` decoration to Fastify instance

### Tests
No test framework configured. Manual verification via TypeScript compilation.

---

## Work Item: server-chat-openrouter

### Approach
Create an `OpenRouterService` class that wraps HTTP calls to the OpenRouter API for streaming chat completions. Support OpenAI-compatible function/tool calling. Use Node.js built-in `fetch` (Node 18+). Configuration via env vars. Follow existing service patterns.

### Files to Create
- `server/src/services/chat/openrouter-service.ts` — OpenRouter API client

### Files to Modify
- `server/src/app.ts` — Add `openrouterService` decoration
- `server/.env.example` — Add `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`

### Tests
No test framework configured. Manual verification via TypeScript compilation.

---

## Implementation Plan for "server-chat-openrouter"

### Approach
1. Create `OpenRouterService` class with methods:
   - `streamChat(messages, tools?)` — sends messages to OpenRouter, returns async iterable of SSE chunks
   - `chat(messages, tools?)` — non-streaming variant for tool call execution loops
2. Use Node.js built-in `fetch` for HTTP calls
3. Parse SSE stream manually (no external dependency needed)
4. Error handling for timeout, rate limiting (429), network errors
5. Tool definitions passed as OpenAI-compatible function schemas
6. Decorated on Fastify instance as `openrouterService`

### Files to Create
- `server/src/services/chat/openrouter-service.ts`

### Files to Modify
- `server/src/app.ts` — Import and decorate `OpenRouterService`
- `server/.env.example` — Add OpenRouter env vars

### Tests
No test framework configured. Compilation check via `pnpm lint` and `pnpm build`.

---

## Work Item: server-vehicle-query-tools

### Approach
Create tool definitions and handlers following OpenAI-compatible function calling schema. Each tool validates vehicle ownership via `bem.cliente` FK before returning data. Use existing services (`gpsService`, `bemService`) for data access. Format results as readable text.

### Files to Create
- `server/src/services/chat/tools.ts` — Tool definitions and handlers

### Files to Modify
- (none — tools are self-contained, consumed by the chat endpoint)

### Tests
No test framework configured. Compilation check via `pnpm lint` and `pnpm build`.

---

## Implementation Plan for "server-vehicle-query-tools"

### Approach
1. Create tool definitions as OpenAI-compatible function schemas:
   - `list_vehicles(userId)` → calls `bemService.getUserVehicles(userId)`
   - `get_vehicle_current_location(imei, userId)` → validates ownership, calls `gpsService.getLastCoordinates(imei, 1)`
   - `get_vehicle_history(imei, startDate, endDate, userId)` → validates ownership, calls `gpsService.getCoordinatesByDateRange(imei, startDate, endDate)`
   - `get_vehicle_speed(imei, userId)` → validates ownership, calls `gpsService.getLastCoordinates(imei, 1)`, extracts speed
2. Each handler validates that the vehicle's `cliente` FK matches the user's ID
3. Results formatted as human-readable text for AI to incorporate into responses
4. Error responses when vehicle not found or no data

### Files to Create
- `server/src/services/chat/tools.ts`

### Files to Modify
- (none)

### Tests
No test framework configured. Compilation check via `pnpm lint` and `pnpm build`.

---

## Work Item: server-chat-endpoint

### Approach
Create a ChatService orchestrator that wires together session store, tools, and OpenRouter service. Create SSE endpoint POST /api/chat with JWT auth. Follow existing routes → controllers → services patterns.

### Files to Create
- `server/src/services/chat/chat-service.ts` — Orchestrator service
- `server/src/controllers/chat.ts` — Chat controller with SSE streaming
- `server/src/routes/chat.ts` — Chat route definition

### Files to Modify
- `server/src/app.ts` — Register chat routes and chatService decoration

### Tests
No test framework configured. Compilation check via `pnpm lint` and `pnpm build`.

---

## Implementation Plan for "server-chat-endpoint"

### Approach
1. **ChatService** orchestrator:
   - `processMessage(userId, message)` → async generator yielding SSE events
   - Gets session, appends user message, sends to OpenRouter with tool definitions
   - Handles tool call loop: if AI calls a tool, execute handler, send result back, stream follow-up
   - Stores messages in session store
2. **Controller** parses request, calls chatService.streamChat(), streams via `reply.raw`
3. **Route** POST /api/chat with JWT `preHandler: authenticate`
4. SSE event types: `token` (content chunk), `tool_call` (tool execution), `error`, `done`

### Files to Create
- `server/src/services/chat/chat-service.ts`
- `server/src/controllers/chat.ts`
- `server/src/routes/chat.ts`

### Files to Modify
- `server/src/app.ts` — Register chat routes + chatService decoration

### Tests
No test framework configured. Compilation check.

---

## Work Item: app-chat-screen

### Approach
Create a new chat screen (`app/chat.tsx`) with Expo Router file-based routing. Implement SSE streaming client using `fetch` + `ReadableStream` for real-time token display. Use existing patterns (tryAuthRequest, ErrorPopupContext, theme system). Add chat float button on home screen.

### Files to Create
- `app/chat.tsx` — Chat screen
- `src/services/chat.ts` — SSE chat API client
- `components/chat-float-button/index.tsx` — FAB for chat access

### Files to Modify
- `app/index.tsx` — Add chat float button

### Tests
No test framework configured. Compilation check.
